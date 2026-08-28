import React, { useState } from 'react';
import { User, UserRole, AuthSession } from '../../types';
import { 
  registerCandidateWithFirebase, 
  registerEmployerWithFirebase, 
  loginWithFirebase, 
  requestPasswordResetFirebase,
  resendVerificationEmail,
  checkEmailVerified,
  logoutFirebase
} from '../../services/firebaseAuth';
import { 
  X, 
  User as UserIcon, 
  Building2, 
  Lock, 
  Mail, 
  Phone, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Loader2,
  RefreshCw,
  Inbox
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  initialRole?: UserRole;
  onAuthSuccess: (user: User, session: AuthSession) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  initialRole = 'candidate',
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'verify_email'>(initialMode);
  const [registerRole, setRegisterRole] = useState<'candidate' | 'business'>(
    initialRole === 'business' ? 'business' : 'candidate'
  );

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Candidate register form state
  const [candFirstName, setCandFirstName] = useState('');
  const [candLastName, setCandLastName] = useState('');
  const [candEmail, setCandEmail] = useState('');
  const [candPhone, setCandPhone] = useState('+994 ');
  const [candPassword, setCandPassword] = useState('');
  const [candConfirmPassword, setCandConfirmPassword] = useState('');

  // Employer register form state
  const [empCompanyName, setEmpCompanyName] = useState('');
  const [empContactName, setEmpContactName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empPhone, setEmpPhone] = useState('+994 ');
  const [empDescription, setEmpDescription] = useState('');
  const [empPassword, setEmpPassword] = useState('');
  const [empConfirmPassword, setEmpConfirmPassword] = useState('');

  // Forgot password form state
  const [forgotEmail, setForgotEmail] = useState('');

  // Verification screen state
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [checkingVerification, setCheckingVerification] = useState(false);

  // Status & feedback
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMsg('Zəhmət olmasa bütün sahələri doldurun.');
      return;
    }

    setLoading(true);
    try {
      const { user, session, isVerified } = await loginWithFirebase(loginEmail, loginPassword);
      
      if (!isVerified && user.role !== 'admin') {
        setRegisteredEmail(user.email);
        setMode('verify_email');
        setErrorMsg('E-poçt ünvanınız hələ təsdiqlənməyib. Zəhmət olmasa poçt qutunuzu yoxlayın.');
        return;
      }

      setSuccessMsg(`Xoş gəldiniz, ${user.fullName}!`);
      setTimeout(() => {
        onAuthSuccess(user, session);
        onClose();
      }, 500);
    } catch (err: any) {
      let msg = err.message || 'Daxil olarkən xəta baş verdi.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        msg = 'E-poçt və ya şifrə yanlışdır.';
      } else if (err.code === 'auth/wrong-password') {
        msg = 'Daxil etdiyiniz şifrə yanlışdır.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Çox sayda uğursuz cəhd edildi. Zəhmət olmasa bir qədər sonra yenidən cəhd edin.';
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCandidateRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!candFirstName.trim() || !candLastName.trim() || !candEmail.trim() || !candPassword.trim()) {
      setErrorMsg('Zəhmət olmasa tələb olunan bütün sahələri doldurun.');
      return;
    }

    if (candPassword.length < 6) {
      setErrorMsg('Şifrə ən azı 6 simvoldan ibarət olmalıdır.');
      return;
    }

    if (candPassword !== candConfirmPassword) {
      setErrorMsg('Daxil etdiyiniz şifrələr uyğun gəlmir.');
      return;
    }

    setLoading(true);
    try {
      const email = candEmail.trim().toLowerCase();
      await registerCandidateWithFirebase({
        firstName: candFirstName,
        lastName: candLastName,
        email: email,
        phone: candPhone,
        password: candPassword,
      });

      setRegisteredEmail(email);
      setMode('verify_email');
      setSuccessMsg(`Təsdiq linki ${email} ünvanına göndərildi!`);
    } catch (err: any) {
      let msg = err.message || 'Qeydiyyat zamanı xəta baş verdi.';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'Bu e-poçt ünvanı ilə artıq qeydiyyatdan keçilib.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Daxil etdiyiniz e-poçt ünvanı düzgün deyil.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Şifrə çox zəifdir. Ən azı 6 simvol daxil edin.';
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleEmployerRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!empCompanyName.trim() || !empContactName.trim() || !empEmail.trim() || !empPassword.trim()) {
      setErrorMsg('Zəhmət olmasa tələb olunan bütün sahələri doldurun.');
      return;
    }

    if (empPassword.length < 6) {
      setErrorMsg('Şifrə ən azı 6 simvoldan ibarət olmalıdır.');
      return;
    }

    if (empPassword !== empConfirmPassword) {
      setErrorMsg('Daxil etdiyiniz şifrələr uyğun gəlmir.');
      return;
    }

    setLoading(true);
    try {
      const email = empEmail.trim().toLowerCase();
      await registerEmployerWithFirebase({
        companyName: empCompanyName,
        contactName: empContactName,
        email: email,
        phone: empPhone,
        password: empPassword,
        description: empDescription,
      });

      setRegisteredEmail(email);
      setMode('verify_email');
      setSuccessMsg(`Təsdiq linki ${email} ünvanına göndərildi!`);
    } catch (err: any) {
      let msg = err.message || 'Qeydiyyat zamanı xəta baş verdi.';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'Bu e-poçt ünvanı ilə artıq qeydiyyatdan keçilib.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Daxil etdiyiniz e-poçt ünvanı düzgün deyil.';
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!forgotEmail.trim()) {
      setErrorMsg('E-poçt ünvanınızı daxil edin.');
      return;
    }

    setLoading(true);
    try {
      await requestPasswordResetFirebase(forgotEmail);
      setSuccessMsg(`Şifrə sıfırlama linki ${forgotEmail} ünvanına göndərildi. Zəhmət olmasa poçt qutunuzu yoxlayın.`);
    } catch (err: any) {
      let msg = err.message || 'Sorğu göndərilərkən xəta baş verdi.';
      if (err.code === 'auth/user-not-found') {
        msg = 'Bu e-poçt ünvanı ilə qeydiyyatdan keçmiş istifadəçi tapılmadı.';
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (resendCooldown > 0) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      await resendVerificationEmail();
      setSuccessMsg('Təsdiq e-poçtu yenidən göndərildi!');
      setResendCooldown(60);
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Yenidən göndərilərkən xəta baş verdi.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckEmailVerified = async () => {
    setCheckingVerification(true);
    setErrorMsg(null);
    try {
      const isVer = await checkEmailVerified();
      if (isVer) {
        setSuccessMsg('Təbriklər! E-poçt ünvanınız uğurla təsdiqləndi.');
        setTimeout(() => {
          setMode('login');
          setLoginEmail(registeredEmail);
        }, 1200);
      } else {
        setErrorMsg('E-poçt hələ təsdiqlənməyib. Zəhmət olmasa poçt qutunuzdakı linkə klikləyin.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Yoxlama zamanı xəta baş verdi.');
    } finally {
      setCheckingVerification(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Rəsmi Giriş Portalı</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            {mode === 'login' && 'Hesabınıza Daxil Olun'}
            {mode === 'register' && 'Yeni Hesab Qeydiyyatı'}
            {mode === 'forgot' && 'Şifrənin Sıfırlanması'}
            {mode === 'verify_email' && 'E-poçt Ünvanınızı Təsdiqləyin'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {mode === 'login' && 'Azərbaycanın rəsmi vakansiya və işə qəbul platformasına daxil olun.'}
            {mode === 'register' && 'Namizəd və ya İşəgötürən kimi platformamızda qeydiyyatdan keçin.'}
            {mode === 'forgot' && 'Qeydiyyatdan keçdiyiniz real e-poçt ünvanını daxil edin.'}
            {mode === 'verify_email' && 'Təhlükəsizlik və etibarlılıq üçün e-poçt təsdiqi tələb olunur.'}
          </p>

          {/* Mode Switcher Tabs */}
          {mode !== 'forgot' && mode !== 'verify_email' && (
            <div className="flex items-center p-1 bg-slate-200/80 rounded-xl mt-4 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-2 rounded-lg transition-all text-center ${
                  mode === 'login'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Daxil Ol
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-2 rounded-lg transition-all text-center ${
                  mode === 'register'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Qeydiyyatdan Keç
              </button>
            </div>
          )}
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6">
          {/* ============================================================== */}
          {/* 1. LOGIN FORM */}
          {/* ============================================================== */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  E-poçt ünvanı *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="ad@shirket.az və ya mail@domen.az"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">Şifrə *</label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                  >
                    Şifrəni unutmusunuz?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>{loading ? 'Yoxlanılır...' : 'Daxil Ol'}</span>
              </button>
            </form>
          )}

          {/* ============================================================== */}
          {/* 2. REGISTRATION FORM */}
          {/* ============================================================== */}
          {mode === 'register' && (
            <div className="space-y-4">
              {/* Role Selection Buttons */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setRegisterRole('candidate')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    registerRole === 'candidate'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Namizəd Kimi</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRegisterRole('business')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    registerRole === 'business'
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>İşəgötürən Kimi</span>
                </button>
              </div>

              {/* CANDIDATE REGISTRATION FIELDS */}
              {registerRole === 'candidate' && (
                <form onSubmit={handleCandidateRegisterSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Ad *</label>
                      <input
                        type="text"
                        required
                        value={candFirstName}
                        onChange={(e) => setCandFirstName(e.target.value)}
                        placeholder="Samir"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Soyad *</label>
                      <input
                        type="text"
                        required
                        value={candLastName}
                        onChange={(e) => setCandLastName(e.target.value)}
                        placeholder="Əliyev"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Real E-poçt ünvanı *</label>
                    <input
                      type="email"
                      required
                      value={candEmail}
                      onChange={(e) => setCandEmail(e.target.value)}
                      placeholder="ad.soyad@mail.az"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                    />
                    <p className="text-[10px] text-slate-400 mt-0.5">Təsdiq linki bu ünvana göndəriləcək.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Əlaqə Nömrəsi *</label>
                    <input
                      type="tel"
                      required
                      value={candPhone}
                      onChange={(e) => setCandPhone(e.target.value)}
                      placeholder="+994 50 123 45 67"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Şifrə *</label>
                      <input
                        type="password"
                        required
                        value={candPassword}
                        onChange={(e) => setCandPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Şifrə Təkrarı *</label>
                      <input
                        type="password"
                        required
                        value={candConfirmPassword}
                        onChange={(e) => setCandConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                    <span>{loading ? 'Qeydiyyat aparılır...' : 'Namizəd Kimi Qeydiyyatdan Keç'}</span>
                  </button>
                </form>
              )}

              {/* EMPLOYER REGISTRATION FIELDS */}
              {registerRole === 'business' && (
                <form onSubmit={handleEmployerRegisterSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Şirkətin Rəsmi Adı *</label>
                    <input
                      type="text"
                      required
                      value={empCompanyName}
                      onChange={(e) => setEmpCompanyName(e.target.value)}
                      placeholder="Məs: Pasha Holding MMC"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-800/20 focus:border-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Əlaqədar Şəxs (HR) *</label>
                      <input
                        type="text"
                        required
                        value={empContactName}
                        onChange={(e) => setEmpContactName(e.target.value)}
                        placeholder="Nigar Əhmədova"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-800/20 focus:border-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Əlaqə Nömrəsi *</label>
                      <input
                        type="tel"
                        required
                        value={empPhone}
                        onChange={(e) => setEmpPhone(e.target.value)}
                        placeholder="+994 12 500 00 00"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-800/20 focus:border-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Şirkət E-poçtu *</label>
                    <input
                      type="email"
                      required
                      value={empEmail}
                      onChange={(e) => setEmpEmail(e.target.value)}
                      placeholder="hr@shirket.az"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-800/20 focus:border-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Şifrə *</label>
                      <input
                        type="password"
                        required
                        value={empPassword}
                        onChange={(e) => setEmpPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-800/20 focus:border-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Şifrə Təkrarı *</label>
                      <input
                        type="password"
                        required
                        value={empConfirmPassword}
                        onChange={(e) => setEmpConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-800/20 focus:border-slate-800"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Building2 className="w-4 h-4" />}
                    <span>{loading ? 'Şirkət qeydiyyatı aparılır...' : 'İşəgötürən Kimi Qeydiyyatdan Keç'}</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* 3. FORGOT PASSWORD */}
          {/* ============================================================== */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Qeydiyyatlı E-poçt ünvanınız
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="ad@shirket.az"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                <span>{loading ? 'Göndərilir...' : 'Sıfırlama Linki Göndər'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="w-full text-center text-xs text-slate-600 hover:text-slate-900 font-semibold"
              >
                ← Giriş səhifəsinə qayıt
              </button>
            </form>
          )}

          {/* ============================================================== */}
          {/* 4. REAL EMAIL VERIFICATION PENDING SCREEN */}
          {/* ============================================================== */}
          {mode === 'verify_email' && (
            <div className="space-y-4 text-center py-2">
              <div className="w-14 h-14 mx-auto rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 animate-bounce">
                <Inbox className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  Email ünvanınızı təsdiqləyin
                </h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  <span className="font-semibold text-blue-700">{registeredEmail}</span> ünvanına rəsmi təsdiq linki göndərildi. Zəhmət olmasa e-poçt qutunuzu yoxlayın və linkə keçid edin.
                </p>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={handleCheckEmailVerified}
                  disabled={checkingVerification}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {checkingVerification ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  <span>{checkingVerification ? 'Yoxlanılır...' : 'Təsdiqlədim, Yoxla və Giriş Et'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleResendEmail}
                  disabled={loading || resendCooldown > 0}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>
                    {resendCooldown > 0 ? `Yenidən göndər (${resendCooldown}s)` : 'Təsdiq e-poçtunu yenidən göndər'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="block mx-auto text-xs text-slate-500 hover:text-slate-800 pt-1"
                >
                  Giriş ekranına keç
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
