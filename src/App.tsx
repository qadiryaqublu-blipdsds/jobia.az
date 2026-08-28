import React, { useState, useEffect } from 'react';
import { 
  UserRole, 
  Vacancy, 
  Company, 
  Application, 
  CVData, 
  ApplicationStatus,
  CVTemplateType,
  JobOffer,
  OfferAuditLog,
  JobOfferTemplate,
  User,
  AuthSession,
  UserSubscription,
  SubscriptionPlan,
  BillingCycle
} from './types';
import { 
  SAMPLE_VACANCIES, 
  SAMPLE_COMPANIES, 
  SAMPLE_APPLICATIONS, 
  SAMPLE_CANDIDATE_CV 
} from './data/mockData';
import { getCurrentUser, getCurrentSession, logoutUser } from './services/authService';
import { getUserSubscription, checkFeatureAccess, SUBSCRIPTION_PLANS } from './services/subscriptionService';
import { Header } from './components/Header';
import { JobiaLogo, HireMeLogo } from './components/JobiaLogo';
import { JobExplorer } from './components/candidate/JobExplorer';
import { JobDetailModal } from './components/candidate/JobDetailModal';
import { CVBuilder } from './components/candidate/CVBuilder';
import { CVAnalyzer } from './components/candidate/CVAnalyzer';
import { InterviewPrepModal } from './components/candidate/InterviewPrepModal';
import { MyApplications } from './components/candidate/MyApplications';
import { SalaryTrendsView } from './components/candidate/SalaryTrendsView';
import { BusinessDashboard } from './components/business/BusinessDashboard';
import { PostJobModal } from './components/business/PostJobModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { GoogleChatHub } from './components/chat/GoogleChatHub';
import { CVRenderer } from './components/cv-templates/CVRenderer';
import { downloadCVAsPDF, generateCVFileName } from './utils/pdfExport';
import { CandidateOfferPortal } from './components/interview-offer/CandidateOfferPortal';
import { getOfferTemplates, saveOfferTemplates } from './services/offerTemplateService';
import { calculateNetSalary } from './services/salaryCalculator';
import { SalariaCalculator } from './components/candidate/SalariaCalculator';
import { SalariaVacatiaBottomDock } from './components/candidate/SalariaVacatiaBottomDock';
import { AuthModal } from './components/auth/AuthModal';
import { PricingPage } from './components/subscription/PricingPage';
import { CheckoutModal } from './components/subscription/CheckoutModal';
import { PaywallModal } from './components/subscription/PaywallModal';
import { Footer } from './components/Footer';
import { 
  X, 
  CheckCircle, 
  Sparkles, 
  Heart, 
  Download, 
  Loader2, 
  Printer, 
  MessageSquare, 
  Award,
  CreditCard,
  Zap,
  Lock,
  ArrowRight
} from 'lucide-react';

const INITIAL_SAMPLE_OFFERS: JobOffer[] = [
  {
    id: 'offer-sample-1',
    applicationId: 'app-1',
    candidateId: 'samir.aliyev@mail.az',
    candidateName: 'Samir Əliyev',
    candidateEmail: 'samir.aliyev@mail.az',
    candidatePhone: '+994 (50) 234-56-78',
    companyId: 'comp-1',
    companyName: 'PashaPay LLC',
    companyLogo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=150&auto=format&fit=crop&q=80',
    companyAddress: 'Port Baku Towers, Neftçilər pr. 153, Bakı',
    companyEmail: 'hr@pashapay.az',
    companyPhone: '+994 (12) 599-88-77',
    hrContactPerson: 'Nərgiz Məmmədova',
    hrContactPosition: 'Aparıcı HR Biznes Tərəfdaşı',
    position: 'Senior Frontend Developer (React / TS)',
    department: 'Məhsul və Rəqəmsal Texnologiyalar',
    employmentType: 'Full-time',
    workLocation: 'Bakı şəh., Port Baku Towers (Hibrid qrafik)',
    startDate: '2026-09-15',
    grossSalary: 3200,
    netSalary: calculateNetSalary(3200).net,
    probationPeriod: '3 months',
    workingSchedule: 'Bazar ertəsi - Cümə, 09:00 - 18:00',
    annualLeave: '21 təqvim günü əsas + 3 gün əlavə staj məzuniyyəti',
    bonus: 'İllik performans və KPI nəticələrinə əsasən 1-3 aylıq əməkhaqqı həcmində mükafat',
    benefits: [
      'Könüllü Tibbi Sığorta (Ailə üzvləri daxil)',
      'Nahar və yol kompensasiyası (Meal allowance)',
      'İllik 1500 AZN peşəkar təlim və sertifikasiya büdcəsi',
      'Korporativ nömrə və limitsiz internet paketi',
      'İdman zalı abunəliyi (Gym membership)'
    ],
    additionalTerms: 'Əmək münasibətləri Azərbaycan Respublikasının Əmək Məcəlləsinə tam uyğun olaraq rəsmiləşdirilir.',
    templateId: 'template-az-standard',
    language: 'az',
    status: 'SENT',
    secureToken: 'token-samir-pashapay-2026',
    createdBy: 'Nərgiz Məmmədova',
    createdAt: '2026-08-25T10:00:00.000Z',
    sentAt: '2026-08-25T10:30:00.000Z',
    updatedAt: '2026-08-25T10:30:00.000Z',
  }
];

const INITIAL_SAMPLE_AUDIT_LOGS: OfferAuditLog[] = [
  {
    id: 'log-1',
    offerId: 'offer-sample-1',
    candidateName: 'Samir Əliyev',
    action: 'OFFER_CREATED',
    user: 'Nərgiz Məmmədova',
    timestamp: '2026-08-25T10:00:00.000Z',
    details: 'Müsahibə nəticələrinə əsasən rəsmi iş təklifi hazırlandı.',
  },
  {
    id: 'log-2',
    offerId: 'offer-sample-1',
    candidateName: 'Samir Əliyev',
    action: 'OFFER_SENT',
    user: 'Nərgiz Məmmədova',
    timestamp: '2026-08-25T10:30:00.000Z',
    details: 'Rəsmi iş təklifi e-poçt və təhlükəsiz link vasitəsilə samir.aliyev@mail.az ünvanına göndərildi.',
  }
];

export default function App() {
  // Navigation & Role State
  const [currentRole, setCurrentRole] = useState<UserRole>('candidate');
  const [candidateTab, setCandidateTab] = useState<'jobs' | 'cv-builder' | 'cv-analyzer' | 'my-applications' | 'salary-trends' | 'calculia' | 'google-chat'>('jobs');
  const [calculiaSubTab, setCalculiaSubTab] = useState<'calculia' | 'vacatia'>('calculia');
  const [isPricingViewOpen, setIsPricingViewOpen] = useState(false);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(() => getCurrentUser());
  const [authSession, setAuthSession] = useState<AuthSession | null>(() => getCurrentSession());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [authModalRole, setAuthModalRole] = useState<UserRole>('candidate');

  // Subscription & Monetization State
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(() => {
    const user = getCurrentUser();
    return getUserSubscription(user?.id, user?.role || 'candidate');
  });
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<SubscriptionPlan | null>(null);
  const [checkoutCycle, setCheckoutCycle] = useState<BillingCycle>('yearly');

  // Paywall Modal State
  const [isPaywallModalOpen, setIsPaywallModalOpen] = useState(false);
  const [paywallProps, setPaywallProps] = useState<{
    requiredTier: string;
    featureTitle: string;
    featureDescription?: string;
  }>({
    requiredTier: 'PRO',
    featureTitle: 'Premium Funksiya',
  });

  // Core Data State
  const [vacancies, setVacancies] = useState<Vacancy[]>(() => {
    const saved = localStorage.getItem('jobia_vacancies') || localStorage.getItem('hireme_vacancies') || localStorage.getItem('findme_vacancies') || localStorage.getItem('istap_vacancies');
    return saved ? JSON.parse(saved) : SAMPLE_VACANCIES;
  });

  const [companies, setCompanies] = useState<Company[]>(() => {
    const saved = localStorage.getItem('jobia_companies') || localStorage.getItem('hireme_companies') || localStorage.getItem('findme_companies') || localStorage.getItem('istap_companies');
    return saved ? JSON.parse(saved) : SAMPLE_COMPANIES;
  });

  const [activeCompany, setActiveCompany] = useState<Company>(companies[0] || SAMPLE_COMPANIES[0]);

  const [applications, setApplications] = useState<Application[]>(() => {
    const saved = localStorage.getItem('jobia_applications') || localStorage.getItem('hireme_applications') || localStorage.getItem('findme_applications') || localStorage.getItem('istap_applications');
    return saved ? JSON.parse(saved) : SAMPLE_APPLICATIONS;
  });

  const [candidateCV, setCandidateCV] = useState<CVData>(() => {
    const saved = localStorage.getItem('jobia_candidate_cv') || localStorage.getItem('hireme_candidate_cv') || localStorage.getItem('findme_candidate_cv') || localStorage.getItem('istap_candidate_cv');
    return saved ? JSON.parse(saved) : SAMPLE_CANDIDATE_CV;
  });

  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('jobia_saved_jobs') || localStorage.getItem('hireme_saved_jobs') || localStorage.getItem('findme_saved_jobs') || localStorage.getItem('istap_saved_jobs');
    return saved ? JSON.parse(saved) : ['vac-1', 'vac-3'];
  });

  const [jobNotes, setJobNotes] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('jobia_job_notes') || localStorage.getItem('hireme_job_notes') || localStorage.getItem('findme_job_notes') || localStorage.getItem('istap_job_notes');
    return saved ? JSON.parse(saved) : {
      'vac-1': 'Müsahibə mərhələsinə hazırlaş: React və TypeScript bilikləri',
      'vac-3': 'Maaş təklifi 1800 AZN müzakirə olundu'
    };
  });

  // Job Offers & Audit Trail State
  const [jobOffers, setJobOffers] = useState<JobOffer[]>(() => {
    const saved = localStorage.getItem('jobia_job_offers') || localStorage.getItem('hireme_job_offers');
    return saved ? JSON.parse(saved) : INITIAL_SAMPLE_OFFERS;
  });

  const [offerAuditLogs, setOfferAuditLogs] = useState<OfferAuditLog[]>(() => {
    const saved = localStorage.getItem('jobia_offer_audit_logs') || localStorage.getItem('hireme_offer_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_SAMPLE_AUDIT_LOGS;
  });

  const [offerTemplates, setOfferTemplates] = useState<JobOfferTemplate[]>(() => {
    return getOfferTemplates();
  });

  // Candidate Portal Navigation / Token State
  const [activePortalOffer, setActivePortalOffer] = useState<JobOffer | null>(null);

  // Modals & Drawers State
  const [selectedJobForDetail, setSelectedJobForDetail] = useState<Vacancy | null>(null);
  const [selectedJobForInterview, setSelectedJobForInterview] = useState<Vacancy | null>(null);
  const [targetVacancyForAnalyzer, setTargetVacancyForAnalyzer] = useState<Vacancy | null>(null);
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
  const [isGoogleChatModalOpen, setIsGoogleChatModalOpen] = useState(false);
  const [viewingSubmittedCVApp, setViewingSubmittedCVApp] = useState<Application | null>(null);
  const [selectedSubmittedTemplate, setSelectedSubmittedTemplate] = useState<CVTemplateType>('modern-emerald');
  const [isDownloadingSubmittedCV, setIsDownloadingSubmittedCV] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Refresh user and subscription whenever role or user changes
  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    setAuthSession(getCurrentSession());
    if (user) {
      setCurrentSubscription(getUserSubscription(user.id, user.role));
    } else {
      setCurrentSubscription(getUserSubscription(undefined, currentRole));
    }
  }, [currentRole]);

  // Check URL token for direct candidate offer acceptance portal
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('offerToken');
    if (token) {
      const match = jobOffers.find((o) => o.secureToken === token);
      if (match) {
        setActivePortalOffer(match);
      }
    }
  }, [jobOffers]);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('jobia_vacancies', JSON.stringify(vacancies));
  }, [vacancies]);

  useEffect(() => {
    localStorage.setItem('jobia_companies', JSON.stringify(companies));
  }, [companies]);

  useEffect(() => {
    localStorage.setItem('jobia_applications', JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem('jobia_candidate_cv', JSON.stringify(candidateCV));
  }, [candidateCV]);

  useEffect(() => {
    localStorage.setItem('jobia_saved_jobs', JSON.stringify(savedJobIds));
  }, [savedJobIds]);

  useEffect(() => {
    localStorage.setItem('jobia_job_notes', JSON.stringify(jobNotes));
  }, [jobNotes]);

  useEffect(() => {
    localStorage.setItem('jobia_job_offers', JSON.stringify(jobOffers));
  }, [jobOffers]);

  useEffect(() => {
    localStorage.setItem('jobia_offer_audit_logs', JSON.stringify(offerAuditLogs));
  }, [offerAuditLogs]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Trigger Paywall helper
  const triggerPaywall = (requiredTier: string, featureTitle: string, featureDescription?: string) => {
    setPaywallProps({
      requiredTier,
      featureTitle,
      featureDescription,
    });
    setIsPaywallModalOpen(true);
  };

  // Handle Auth success
  const handleAuthSuccess = (user: User, session: AuthSession) => {
    setCurrentUser(user);
    setAuthSession(session);
    setCurrentRole(user.role);
    setCurrentSubscription(getUserSubscription(user.id, user.role));
    showToast(`Xoş gəldiniz, ${user.fullName}!`);
  };

  // Handle Logout
  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setAuthSession(null);
    setCurrentSubscription(getUserSubscription(undefined, currentRole));
    showToast('Sistemdən uğurla çıxış edildi.');
  };

  // Handle Opening Auth Modal
  const handleOpenAuth = (mode: 'login' | 'register' = 'login', role?: UserRole) => {
    setAuthModalMode(mode);
    setAuthModalRole(role || currentRole);
    setIsAuthModalOpen(true);
  };

  // Handle Plan selection for checkout
  const handleSelectPlan = (plan: SubscriptionPlan, cycle: BillingCycle) => {
    setSelectedPlanForCheckout(plan);
    setCheckoutCycle(cycle);
    setIsPricingViewOpen(false);
    setIsCheckoutModalOpen(true);
  };

  // Handle Checkout success
  const handleCheckoutSuccess = (newSub: UserSubscription) => {
    setCurrentSubscription(newSub);
    setIsCheckoutModalOpen(false);
    showToast(`Təbriklər! ${newSub.tier} abunəliyiniz aktivləşdirildi!`);
  };

  // Save personal candidate note for a vacancy
  const handleSaveJobNote = (jobId: string, note: string) => {
    setJobNotes((prev) => ({
      ...prev,
      [jobId]: note
    }));
    showToast(note.trim() ? 'Qeyd yadda saxlanıldı' : 'Qeyd silindi');
  };

  // Toggle Job Bookmark
  const handleToggleBookmark = (jobId: string) => {
    setSavedJobIds((prev) => {
      const exists = prev.includes(jobId);
      const updated = exists ? prev.filter((id) => id !== jobId) : [...prev, jobId];
      showToast(exists ? 'Vakansiya yaddaşdan silindi' : 'Vakansiya yadda saxlanıldı');
      return updated;
    });
  };

  // Submit Job Application
  const handleApplyToJob = (vacancy: Vacancy, coverNote: string, cv: CVData) => {
    const alreadyApplied = applications.some(
      (a) => a.vacancyId === vacancy.id && a.candidateEmail === cv.personalInfo.email
    );

    if (alreadyApplied) {
      showToast('Siz bu vakansiyaya artıq müraciət etmisiniz.');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const newApp: Application = {
      id: `app-${Date.now()}`,
      vacancyId: vacancy.id,
      vacancyTitle: vacancy.title,
      companyId: vacancy.companyId,
      companyName: vacancy.companyName,
      companyLogo: vacancy.companyLogo,
      candidateName: cv.personalInfo.fullName,
      candidateEmail: cv.personalInfo.email,
      candidatePhone: cv.personalInfo.phone,
      appliedDate: today,
      status: 'Müraciət edildi',
      matchScore: Math.floor(Math.random() * 16) + 82, // AI estimated match 82-97%
      coverNote: coverNote.trim() || undefined,
      cvData: cv,
    };

    setApplications((prev) => [newApp, ...prev]);

    // Increase applicant count on vacancy
    setVacancies((prev) =>
      prev.map((v) => (v.id === vacancy.id ? { ...v, applicantsCount: (v.applicantsCount || 0) + 1 } : v))
    );

    showToast('Təbriklər! Müraciətiniz uğurla şirkətə göndərildi.');
  };

  // Save candidate CV
  const handleSaveCV = (updatedCV: CVData) => {
    setCandidateCV(updatedCV);
    showToast('CV məlumatlarınız uğurla yadda saxlanıldı.');
  };

  // Handle Business posting new job (Direct & frictionless)
  const handleAttemptPostJob = () => {
    setIsPostJobModalOpen(true);
  };

  const handleSaveNewJob = (newJob: Partial<Vacancy>) => {
    const today = new Date().toISOString().split('T')[0];
    const deadlineDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const fullJob: Vacancy = {
      id: newJob.id || `vac-${Date.now()}`,
      title: newJob.title || 'Vakansiya',
      companyId: activeCompany.id,
      companyName: activeCompany.name,
      companyLogo: activeCompany.logo,
      companyVerified: activeCompany.verified ?? true,
      category: newJob.category || 'İT və Proqramlaşdırma',
      employmentType: newJob.employmentType || 'Tam ştat',
      experienceLevel: newJob.experienceLevel || 'Orta (Mid-level, 1-3 il)',
      city: newJob.city || 'Bakı',
      minSalary: newJob.minSalary,
      maxSalary: newJob.maxSalary,
      currency: newJob.currency || 'AZN',
      hideSalary: newJob.hideSalary || false,
      description: newJob.description || '',
      responsibilities: newJob.responsibilities || [],
      requirements: newJob.requirements || [],
      benefits: newJob.benefits || [],
      skills: newJob.skills || [],
      postedDate: newJob.postedDate || today,
      deadline: newJob.deadline || deadlineDate,
      isFeatured: newJob.isFeatured ?? true,
      isApproved: true,
      viewsCount: 1,
      applicantsCount: 0,
      contactPhone: newJob.contactPhone || activeCompany.phone,
      contactWhatsapp: newJob.contactWhatsapp || activeCompany.phone,
      isBlueCollarFriendly: newJob.isBlueCollarFriendly ?? false,
    };

    setVacancies((prev) => [fullJob, ...prev]);
    showToast('Yeni vakansiya uğurla dərc edildi!');
  };

  // Handle Business updating application status
  const handleUpdateApplicationStatus = (appId: string, status: ApplicationStatus, notes?: string) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status, recruiterNotes: notes } : a))
    );
    showToast('Namizəd statusu və qeydi yeniləndi.');
  };

  // Handle Job Offer workflow creation & updates
  const handleSaveJobOffer = (offer: JobOffer, log: OfferAuditLog) => {
    setJobOffers((prev) => {
      const idx = prev.findIndex((o) => o.id === offer.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = offer;
        return copy;
      }
      return [offer, ...prev];
    });

    setOfferAuditLogs((prev) => [log, ...prev]);
    showToast('İş təklifi məlumatları və audit qeydi qeydə alındı.');
  };

  // Handle Candidate response to offer
  const handleUpdateOfferStatus = (
    offerId: string,
    status: any,
    declineReason?: any,
    auditLog?: OfferAuditLog
  ) => {
    const now = new Date().toISOString();
    setJobOffers((prev) =>
      prev.map((o) => {
        if (o.id !== offerId) return o;
        return {
          ...o,
          status,
          declineReason: declineReason || o.declineReason,
          acceptedAt: status === 'ACCEPTED' ? now : o.acceptedAt,
          declinedAt: status === 'DECLINED' ? now : o.declinedAt,
          viewedAt: status === 'VIEWED' && !o.viewedAt ? now : o.viewedAt,
          updatedAt: now,
        };
      })
    );

    if (auditLog) {
      setOfferAuditLogs((prev) => [auditLog, ...prev]);
    }

    // Also update associated application status if accepted or declined
    const targetOffer = jobOffers.find((o) => o.id === offerId);
    if (targetOffer) {
      if (status === 'ACCEPTED') {
        setApplications((prev) =>
          prev.map((a) =>
            a.id === targetOffer.applicationId || a.candidateEmail === targetOffer.candidateEmail
              ? { ...a, status: 'Qəbul edildi', recruiterNotes: 'Namizəd rəsmi iş təklifini qəbul etdi.' }
              : a
          )
        );
      } else if (status === 'DECLINED') {
        setApplications((prev) =>
          prev.map((a) =>
            a.id === targetOffer.applicationId || a.candidateEmail === targetOffer.candidateEmail
              ? { ...a, status: 'İmtina edildi', recruiterNotes: `Namizəd təklifdən imtina etdi (${declineReason?.category || ''}).` }
              : a
          )
        );
      }
    }
  };

  const handleUpdateCompany = (updated: Company) => {
    setCompanies((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleUpdateTemplates = (updated: JobOfferTemplate[]) => {
    setOfferTemplates(updated);
    saveOfferTemplates(updated);
    showToast('Təklif şablonları yeniləndi.');
  };

  // Admin Actions
  const handleApproveVacancy = (jobId: string) => {
    setVacancies((prev) => prev.map((v) => (v.id === jobId ? { ...v, isApproved: true } : v)));
    showToast('Vakansiya təsdiqləndi və saytda dərc edildi.');
  };

  const handleRejectVacancy = (jobId: string) => {
    setVacancies((prev) => prev.map((v) => (v.id === jobId ? { ...v, isApproved: false } : v)));
    showToast('Vakansiya dərcdən çıxarıldı.');
  };

  const handleToggleFeatureVacancy = (jobId: string) => {
    setVacancies((prev) =>
      prev.map((v) => (v.id === jobId ? { ...v, isFeatured: !v.isFeatured } : v))
    );
    showToast('Vakansiyanın Premium statusu dəyişdirildi.');
  };

  const handleDeleteVacancy = (jobId: string) => {
    setVacancies((prev) => prev.filter((v) => v.id !== jobId));
    showToast('Vakansiya silindi.');
  };

  const handleToggleCompanyVerified = (companyId: string) => {
    setCompanies((prev) =>
      prev.map((c) => (c.id === companyId ? { ...c, verified: !c.verified } : c))
    );
    showToast('Şirkətin verifikasiya statusu dəyişdirildi.');
  };

  // If candidate is viewing their secure offer link portal
  if (activePortalOffer) {
    return (
      <CandidateOfferPortal
        offer={activePortalOffer}
        onUpdateOfferStatus={(offerId, status, reason, log) => {
          handleUpdateOfferStatus(offerId, status, reason, log);
          setActivePortalOffer((prev) => (prev ? { ...prev, status, declineReason: reason } : null));
        }}
        onBackToApp={() => {
          setActivePortalOffer(null);
          // clear query string from browser
          window.history.replaceState({}, document.title, window.location.pathname);
        }}
      />
    );
  }

  // If Pricing View is active
  if (isPricingViewOpen) {
    return (
      <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
        <Header
          currentRole={currentRole}
          onRoleChange={(role) => setCurrentRole(role)}
          candidateTab={candidateTab}
          onCandidateTabChange={(tab) => setCandidateTab(tab)}
          applicationsCount={applications.length}
          savedJobsCount={savedJobIds.length}
          activeVacanciesCount={vacancies.filter((v) => v.isApproved !== false).length}
          pendingApprovalsCount={vacancies.filter((v) => v.isApproved === false).length}
          currentUser={currentUser}
          currentSubscription={currentSubscription}
          onOpenAuthModal={handleOpenAuth}
          onOpenPricing={() => setIsPricingViewOpen(true)}
          onLogout={handleLogout}
        />
        <main className="flex-1 w-full max-w-full">
          <PricingPage
            currentUser={currentUser}
            currentRole={currentRole}
            currentSubscription={currentSubscription}
            onSelectPlan={handleSelectPlan}
            onBack={() => setIsPricingViewOpen(false)}
            onRequireAuth={() => handleOpenAuth('login', currentRole)}
          />
        </main>
        <Footer
          currentRole={currentRole}
          onRoleChange={(role) => setCurrentRole(role)}
          onNavigateCandidateTab={(tab) => {
            setIsPricingViewOpen(false);
            setCandidateTab(tab);
          }}
          onOpenPricing={() => setIsPricingViewOpen(true)}
        />
        {/* Checkout Modal */}
        {isCheckoutModalOpen && selectedPlanForCheckout && (
          <CheckoutModal
            isOpen={isCheckoutModalOpen}
            onClose={() => setIsCheckoutModalOpen(false)}
            plan={selectedPlanForCheckout}
            billingCycle={checkoutCycle}
            currentUser={currentUser}
            currentRole={currentRole}
            onSuccess={handleCheckoutSuccess}
            onRequireAuth={() => handleOpenAuth('login', currentRole)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Platform Header with Role Switcher & Auth */}
      <Header
        currentRole={currentRole}
        onRoleChange={(role) => setCurrentRole(role)}
        candidateTab={candidateTab}
        onCandidateTabChange={(tab) => setCandidateTab(tab)}
        applicationsCount={applications.length}
        savedJobsCount={savedJobIds.length}
        activeVacanciesCount={vacancies.filter((v) => v.isApproved !== false).length}
        pendingApprovalsCount={vacancies.filter((v) => v.isApproved === false).length}
        onOpenGoogleChat={() => {
          if (currentRole === 'candidate') {
            setCandidateTab('google-chat');
          } else {
            setIsGoogleChatModalOpen(true);
          }
        }}
        currentUser={currentUser}
        currentSubscription={currentSubscription}
        onOpenAuthModal={handleOpenAuth}
        onOpenPricing={() => setIsPricingViewOpen(true)}
        onLogout={handleLogout}
        onPostJobClick={handleAttemptPostJob}
      />

      {/* Main App Container */}
      <main className="flex-1 w-full max-w-full px-3 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-4 sm:py-6 lg:py-8">
        {/* CANDIDATE ROLE VIEWS */}
        {currentRole === 'candidate' && (
          <div>
            {candidateTab === 'jobs' && (
              <JobExplorer
                vacancies={vacancies}
                onSelectVacancy={(job) => setSelectedJobForDetail(job)}
                savedJobIds={savedJobIds}
                onToggleBookmark={handleToggleBookmark}
                jobNotes={jobNotes}
                onSaveJobNote={handleSaveJobNote}
                onQuickApply={(job) => {
                  handleApplyToJob(job, 'Tez müraciət vasitəsilə göndərildi.', candidateCV);
                }}
                onOpenCVAnalyzer={() => {
                  setTargetVacancyForAnalyzer(null);
                  setCandidateTab('cv-analyzer');
                }}
                onOpenCVBuilder={() => setCandidateTab('cv-builder')}
                onOpenSalaryTrends={() => setCandidateTab('salary-trends')}
                onOpenCalculia={() => setCandidateTab('calculia')}
                userCV={candidateCV}
              />
            )}

            {candidateTab === 'salary-trends' && (
              <SalaryTrendsView
                vacancies={vacancies}
                onSelectVacancy={(job) => setSelectedJobForDetail(job)}
              />
            )}

            {candidateTab === 'calculia' && (
              <SalariaCalculator
                defaultSubTab={calculiaSubTab}
                onExploreJobs={() => setCandidateTab('jobs')}
              />
            )}

            {candidateTab === 'cv-builder' && (
              <CVBuilder
                cvData={candidateCV}
                onSaveCV={handleSaveCV}
                onAnalyzeCV={(cv) => {
                  setCandidateCV(cv);
                  setCandidateTab('cv-analyzer');
                }}
              />
            )}

            {candidateTab === 'cv-analyzer' && (
              <CVAnalyzer
                cvData={candidateCV}
                vacancies={vacancies}
                initialTargetVacancy={targetVacancyForAnalyzer}
                onNavigateToBuilder={() => setCandidateTab('cv-builder')}
              />
            )}

            {candidateTab === 'my-applications' && (
              <MyApplications
                applications={applications}
                offers={jobOffers}
                onOpenCVModal={(app) => setViewingSubmittedCVApp(app)}
                onExploreJobs={() => setCandidateTab('jobs')}
                onViewOffer={(offer) => setActivePortalOffer(offer)}
              />
            )}

            {candidateTab === 'google-chat' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setCandidateTab('jobs')}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    ← Vakansiyalara qayıt
                  </button>
                  <span className="text-xs text-slate-500">Google Chat ilə real-vaxt komanda və rekruter əlaqəsi</span>
                </div>
                <div className="h-[750px] max-h-[85vh]">
                  <GoogleChatHub
                    vacancies={vacancies}
                    applications={applications}
                    candidateCV={candidateCV}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* BUSINESS / RECRUITER ROLE VIEW */}
        {currentRole === 'business' && (
          <BusinessDashboard
            companies={companies}
            activeCompany={activeCompany}
            setActiveCompany={setActiveCompany}
            vacancies={vacancies}
            applications={applications}
            offers={jobOffers}
            auditLogs={offerAuditLogs}
            templates={offerTemplates}
            onOpenPostJobModal={handleAttemptPostJob}
            onUpdateApplicationStatus={handleUpdateApplicationStatus}
            onDeleteJob={handleDeleteVacancy}
            onSaveOffer={handleSaveJobOffer}
            onUpdateOfferStatus={handleUpdateOfferStatus}
            onUpdateTemplates={handleUpdateTemplates}
            onUpdateCompany={handleUpdateCompany}
            onOpenCandidatePortal={(offer) => setActivePortalOffer(offer)}
            onShareToGoogleChat={(app) => {
              setIsGoogleChatModalOpen(true);
            }}
          />
        )}

        {/* ADMIN ROLE VIEW */}
        {currentRole === 'admin' && (
          <AdminDashboard
            vacancies={vacancies}
            companies={companies}
            applications={applications}
            onApproveVacancy={handleApproveVacancy}
            onRejectVacancy={handleRejectVacancy}
            onToggleFeatureVacancy={handleToggleFeatureVacancy}
            onDeleteVacancy={handleDeleteVacancy}
            onToggleCompanyVerified={handleToggleCompanyVerified}
          />
        )}
      </main>

      {/* ============================================================== */}
      {/* GLOBAL MODALS */}
      {/* ============================================================== */}

      {/* 1. Auth Modal (Login / Register / Forgot Password) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        initialRole={authModalRole}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* 2. Checkout Modal (Card input, test autofill, instant subscription activation) */}
      {isCheckoutModalOpen && selectedPlanForCheckout && (
        <CheckoutModal
          isOpen={isCheckoutModalOpen}
          onClose={() => setIsCheckoutModalOpen(false)}
          plan={selectedPlanForCheckout}
          billingCycle={checkoutCycle}
          currentUser={currentUser}
          currentRole={currentRole}
          onSuccess={handleCheckoutSuccess}
          onRequireAuth={() => handleOpenAuth('login', currentRole)}
        />
      )}

      {/* 3. Feature Paywall Modal */}
      <PaywallModal
        isOpen={isPaywallModalOpen}
        onClose={() => setIsPaywallModalOpen(false)}
        requiredTier={paywallProps.requiredTier}
        featureTitle={paywallProps.featureTitle}
        featureDescription={paywallProps.featureDescription}
        userRole={currentRole}
        onUpgradeClick={() => {
          setIsPaywallModalOpen(false);
          setIsPricingViewOpen(true);
        }}
      />

      {/* 4. Job Detail & Apply Modal */}
      {selectedJobForDetail && (
        <JobDetailModal
          vacancy={selectedJobForDetail}
          onClose={() => setSelectedJobForDetail(null)}
          savedCV={candidateCV}
          onApply={handleApplyToJob}
          hasApplied={applications.some(
            (a) => a.vacancyId === selectedJobForDetail.id && a.candidateEmail === candidateCV.personalInfo.email
          )}
          jobNote={jobNotes[selectedJobForDetail.id] || ''}
          onSaveJobNote={(note) => handleSaveJobNote(selectedJobForDetail.id, note)}
          isSaved={savedJobIds.includes(selectedJobForDetail.id)}
          onToggleBookmark={() => handleToggleBookmark(selectedJobForDetail.id)}
          onOpenInterviewPrep={(vac) => setSelectedJobForInterview(vac)}
          onOpenCVAnalyzerForJob={(vac) => {
            setTargetVacancyForAnalyzer(vac);
            setCandidateTab('cv-analyzer');
          }}
          onShareToGoogleChat={(vac) => {
            setIsGoogleChatModalOpen(true);
          }}
        />
      )}

      {/* 5. AI Interview Preparation Modal */}
      {selectedJobForInterview && (
        <InterviewPrepModal
          vacancy={selectedJobForInterview}
          onClose={() => setSelectedJobForInterview(null)}
        />
      )}

      {/* 6. Post Job Modal (Business) */}
      {isPostJobModalOpen && (
        <PostJobModal
          company={activeCompany}
          onClose={() => setIsPostJobModalOpen(false)}
          onSaveJob={handleSaveNewJob}
        />
      )}

      {/* 7. Viewing Submitted Application CV Modal */}
      {viewingSubmittedCVApp && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="bg-white w-full max-w-4xl rounded-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {viewingSubmittedCVApp.vacancyTitle} üçün Göndərilən CV
                </h3>
                <p className="text-xs text-slate-500">
                  Şirkət: {viewingSubmittedCVApp.companyName} • Status: {viewingSubmittedCVApp.status}
                </p>
              </div>

              {/* Template Picker in Modal */}
              <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-lg text-xs font-medium shadow-2xs">
                <span className="text-[10px] text-slate-400 font-bold px-1.5 uppercase">Şablon:</span>
                <button
                  type="button"
                  onClick={() => setSelectedSubmittedTemplate('modern-emerald')}
                  className={`px-2 py-1 rounded-md transition-all text-xs cursor-pointer ${
                    selectedSubmittedTemplate === 'modern-emerald' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Zümrüd
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSubmittedTemplate('classic-corporate')}
                  className={`px-2 py-1 rounded-md transition-all text-xs cursor-pointer ${
                    selectedSubmittedTemplate === 'classic-corporate' ? 'bg-slate-800 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Klassik
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSubmittedTemplate('minimal-indigo')}
                  className={`px-2 py-1 rounded-md transition-all text-xs cursor-pointer ${
                    selectedSubmittedTemplate === 'minimal-indigo' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Minimal
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSubmittedTemplate('slate-tech')}
                  className={`px-2 py-1 rounded-md transition-all text-xs cursor-pointer ${
                    selectedSubmittedTemplate === 'slate-tech' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Tech
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="btn-modal-download-cv-pdf"
                  onClick={async () => {
                    if (isDownloadingSubmittedCV) return;
                    setIsDownloadingSubmittedCV(true);
                    try {
                      const fileName = generateCVFileName(viewingSubmittedCVApp.cvData);
                      await downloadCVAsPDF('modal-submitted-cv-export', { fileName });
                      showToast('CV uğurla PDF kimi birbaşa yükləndi!');
                    } catch (err) {
                      console.error('PDF export error:', err);
                      window.print();
                    } finally {
                      setIsDownloadingSubmittedCV(false);
                    }
                  }}
                  disabled={isDownloadingSubmittedCV}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer disabled:opacity-60"
                  title="CV-ni dərhal PDF formatında yüklə"
                >
                  {isDownloadingSubmittedCV ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>{isDownloadingSubmittedCV ? 'PDF Hazırlanır...' : 'CV-ni PDF kimi yüklə'}</span>
                </button>
                <button
                  onClick={() => setViewingSubmittedCVApp(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto bg-slate-100 flex-1">
              <CVRenderer id="modal-submitted-cv-export" data={viewingSubmittedCVApp.cvData} template={selectedSubmittedTemplate} />
            </div>
          </div>
        </div>
      )}

      {/* 8. Google Chat Floating / Modal Workspace */}
      {isGoogleChatModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[90vh] max-h-[850px]">
            <div className="p-3.5 px-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-2xs">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">Google Chat Hub</h3>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                      Komanda & HR Əlaqəsi
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Real-vaxt Google Chat otaqları, vakansiya və namizəd kartlarının birbaşa paylaşımı
                  </p>
                </div>
              </div>

              <button
                id="btn-close-google-chat-modal"
                onClick={() => setIsGoogleChatModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors cursor-pointer"
                title="Bağla"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden">
              <GoogleChatHub
                vacancies={vacancies}
                applications={applications}
                candidateCV={candidateCV}
                onClose={() => setIsGoogleChatModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2.5 text-xs font-semibold animate-fade-in">
          <CheckCircle className="w-4 h-4 text-blue-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Floating Sticky Bottom Dock for Salaria & Vacatia */}
      <SalariaVacatiaBottomDock
        currentActiveTab={candidateTab}
        onOpenSalaria={(subTab = 'salaria') => {
          setIsPricingViewOpen(false);
          setCurrentRole('candidate');
          setCalculiaSubTab(subTab === 'vacatia' ? 'vacatia' : 'calculia');
          setCandidateTab('calculia');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Footer with large logo and sweet slogan */}
      <Footer
        currentRole={currentRole}
        onRoleChange={(role) => {
          setIsPricingViewOpen(false);
          setCurrentRole(role);
        }}
        onNavigateCandidateTab={(tab) => {
          setIsPricingViewOpen(false);
          setCurrentRole('candidate');
          setCandidateTab(tab);
        }}
        onOpenPricing={() => setIsPricingViewOpen(true)}
      />
    </div>
  );
}
