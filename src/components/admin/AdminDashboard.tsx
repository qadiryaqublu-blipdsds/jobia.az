import React, { useState } from 'react';
import { 
  Vacancy, 
  Application, 
  Company, 
  User, 
  UserSubscription, 
  PaymentTransaction 
} from '../../types';
import { 
  getStoredSubscriptions, 
  saveStoredSubscriptions,
  getStoredTransactions
} from '../../services/subscriptionService';
import { 
  getStoredUsers, 
  saveStoredUsers, 
  toggleUserAccountStatus 
} from '../../services/authService';
import { 
  ShieldCheck, 
  XCircle, 
  Star, 
  Trash2, 
  Search, 
  Check,
  CreditCard,
  Users,
  Building2,
  FileText,
  UserCheck,
  UserX,
  TrendingUp,
  DollarSign,
  Calendar,
  AlertCircle,
  Sparkles,
  RefreshCw
} from 'lucide-react';

interface AdminDashboardProps {
  vacancies: Vacancy[];
  companies: Company[];
  applications: Application[];
  onApproveVacancy: (id: string) => void;
  onRejectVacancy: (id: string) => void;
  onToggleFeatureVacancy: (id: string) => void;
  onDeleteVacancy: (id: string) => void;
  onToggleCompanyVerified: (id: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  vacancies,
  companies,
  applications,
  onApproveVacancy,
  onRejectVacancy,
  onToggleFeatureVacancy,
  onDeleteVacancy,
  onToggleCompanyVerified,
}) => {
  const [activeTab, setActiveTab] = useState<'vacancies' | 'subscriptions' | 'users' | 'companies' | 'applications'>('subscriptions');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Local state for live user and subscription updates in admin panel
  const [users, setUsers] = useState<User[]>(() => getStoredUsers());
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>(() => getStoredSubscriptions());
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(() => getStoredTransactions());

  const handleRefresh = () => {
    setUsers(getStoredUsers());
    setSubscriptions(getStoredSubscriptions());
    setTransactions(getStoredTransactions());
  };

  // Toggle user status
  const handleToggleUserStatus = (userId: string) => {
    try {
      toggleUserAccountStatus(userId);
      setUsers(getStoredUsers());
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle subscription status
  const handleToggleSubStatus = (subId: string) => {
    const updated = subscriptions.map((s) => {
      if (s.id === subId) {
        return {
          ...s,
          status: s.status === 'ACTIVE' ? 'CANCELLED' : ('ACTIVE' as const),
          updatedAt: new Date().toISOString(),
        };
      }
      return s;
    });
    setSubscriptions(updated);
    saveStoredSubscriptions(updated);
  };

  // Calculate MRR / ARR and Stats
  const activeSubs = subscriptions.filter((s) => s.status === 'ACTIVE');
  const totalMRR = activeSubs.reduce((sum, s) => {
    if (s.tier === 'FREE') return sum;
    return sum + (s.billingCycle === 'yearly' ? s.amount / 12 : s.amount);
  }, 0);

  const totalRevenue = transactions
    .filter((t) => t.status === 'SUCCESS')
    .reduce((sum, t) => sum + t.amount, 0);

  const approvedVacanciesCount = vacancies.filter((v) => v.isApproved !== false).length;

  const filteredVacancies = vacancies.filter((v) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return v.title.toLowerCase().includes(q) || v.companyName.toLowerCase().includes(q) || v.category.toLowerCase().includes(q);
  });

  const filteredUsers = users.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.companyName && u.companyName.toLowerCase().includes(q))
    );
  });

  const filteredSubs = subscriptions.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.userName.toLowerCase().includes(q) ||
      s.userEmail.toLowerCase().includes(q) ||
      s.tier.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold mb-2">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>jobia.az Baş İnzibatçı və Monetizasiya Paneli</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">Platforma İdarəetmə Mərkəzi</h1>
          <p className="text-xs text-slate-400 mt-1">
            Abunəliklər, maliyyə axınları, istifadəçilərin moderasiyası və vakansiya nəzarəti.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 font-medium text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Yenilə</span>
          </button>
          <span className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 font-medium text-emerald-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Sistem Aktivdir
          </span>
        </div>
      </div>

      {/* Financial & Platform KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Aylıq Gəlir (MRR)</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{Math.round(totalMRR)} AZN</div>
          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
            <TrendingUp className="w-3 h-3" /> Real abunəliklər üzrə
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ödənişli Abunəçilər</span>
            <CreditCard className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {activeSubs.filter((s) => s.tier !== 'FREE').length}
          </div>
          <span className="text-[11px] text-blue-600 font-medium">Pro, Business & Premium</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Qeydiyyatlı İstifadəçilər</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{users.length}</div>
          <span className="text-[11px] text-purple-600 font-medium">
            {users.filter((u) => u.role === 'business').length} Şirkət • {users.filter((u) => u.role === 'candidate').length} Namizəd
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Vakansiyalar</span>
            <FileText className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{vacancies.length}</div>
          <span className="text-[11px] text-emerald-600 font-medium">{approvedVacanciesCount} aktiv təsdiqli</span>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs font-bold overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg whitespace-nowrap transition-all ${
            activeTab === 'subscriptions'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Abunəliklər və Ödənişlər ({subscriptions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg whitespace-nowrap transition-all ${
            activeTab === 'users'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>İstifadəçilər ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('vacancies')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg whitespace-nowrap transition-all ${
            activeTab === 'vacancies'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Vakansiya Moderasiyası ({vacancies.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('companies')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg whitespace-nowrap transition-all ${
            activeTab === 'companies'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Şirkətlər ({companies.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('applications')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg whitespace-nowrap transition-all ${
            activeTab === 'applications'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Müraciətlər ({applications.length})</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: SUBSCRIPTIONS & MONETIZATION MANAGEMENT */}
      {/* ============================================================== */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <h3 className="font-black text-slate-900 text-sm">Bütün Aktiv və Tarixi Abunəliklər</h3>
                <p className="text-slate-500 text-[11px]">İşəgötürən və namizədlərin monetizasiya statusu</p>
              </div>
              <div className="relative max-w-xs w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="İstifadəçi və ya plan axtar..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-hidden focus:bg-white focus:border-blue-600 text-xs"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-800">
                  <tr>
                    <th className="p-3.5">İstifadəçi / Şirkət</th>
                    <th className="p-3.5">Rol</th>
                    <th className="p-3.5">Plan & Dərəcə</th>
                    <th className="p-3.5">Dövriyyə / Məbləğ</th>
                    <th className="p-3.5">Müddət</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Əməliyyat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSubs.map((sub) => {
                    const isExp = new Date(sub.endDate) < new Date();
                    return (
                      <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{sub.userName}</div>
                          <div className="text-[11px] text-slate-500">{sub.userEmail}</div>
                        </td>

                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              sub.role === 'business'
                                ? 'bg-slate-100 text-slate-800'
                                : 'bg-blue-50 text-blue-700'
                            }`}
                          >
                            {sub.role === 'business' ? 'İşəgötürən' : 'Namizəd'}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-black ${
                              sub.tier === 'BUSINESS'
                                ? 'bg-purple-100 text-purple-800'
                                : sub.tier === 'PRO'
                                ? 'bg-blue-100 text-blue-800'
                                : sub.tier === 'PREMIUM'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {sub.tier}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{sub.amount} AZN</div>
                          <div className="text-[10px] text-slate-500 uppercase font-semibold">
                            {sub.billingCycle === 'yearly' ? 'İllik' : 'Aylıq'}
                          </div>
                        </td>

                        <td className="p-3.5">
                          <div className="text-slate-800 font-medium">
                            {new Date(sub.startDate).toLocaleDateString('az-AZ')} -{' '}
                            {new Date(sub.endDate).toLocaleDateString('az-AZ')}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {isExp ? 'Müddəti bitib' : 'Davam edir'}
                          </div>
                        </td>

                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              sub.status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {sub.status === 'ACTIVE' ? 'Aktiv' : 'Dayandırılıb'}
                          </span>
                        </td>

                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handleToggleSubStatus(sub.id)}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition-colors ${
                              sub.status === 'ACTIVE'
                                ? 'border-red-200 text-red-700 hover:bg-red-50'
                                : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                            }`}
                          >
                            {sub.status === 'ACTIVE' ? 'Dayandır' : 'Aktivləşdir'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Transactions Log */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 font-black text-xs text-slate-900">
              Son Ödəniş Tranzaksiyaları Jurnalı ({transactions.length})
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              {transactions.map((tx) => (
                <div key={tx.id} className="p-4 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-slate-900">{tx.planName}</div>
                    <div className="text-slate-500 text-[11px]">
                      {tx.userName} ({tx.userEmail}) • {tx.paymentMethod}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-slate-900 text-sm">{tx.amount} {tx.currency}</div>
                    <div className="text-[10px] text-emerald-600 font-bold">✓ Ödənilib ({new Date(tx.transactionDate).toLocaleDateString('az-AZ')})</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: USERS MANAGEMENT */}
      {/* ============================================================== */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="font-black text-slate-900 text-sm">
              Qeydiyyatdan Keçmiş Bütün İstifadəçilər ({users.length})
            </div>
            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ad, e-poçt və ya şirkət axtar..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-hidden focus:bg-white focus:border-blue-600 text-xs"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-800">
                <tr>
                  <th className="p-3.5">İstifadəçi</th>
                  <th className="p-3.5">Rol</th>
                  <th className="p-3.5">Telefon / Şirkət</th>
                  <th className="p-3.5">Qeydiyyat Tarixi</th>
                  <th className="p-3.5">Hesab Statusu</th>
                  <th className="p-3.5 text-right">Əməliyyatlar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user.fullName}`}
                          alt={user.fullName}
                          className="w-8 h-8 rounded-full border border-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{user.fullName}</div>
                          <div className="text-[11px] text-slate-500">{user.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : user.role === 'business'
                            ? 'bg-slate-800 text-white'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {user.role === 'admin' ? 'Admin' : user.role === 'business' ? 'İşəgötürən' : 'Namizəd'}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <div className="font-medium text-slate-800">{user.companyName || '-'}</div>
                      <div className="text-[11px] text-slate-500">{user.phone || 'Göstərilməyib'}</div>
                    </td>

                    <td className="p-3.5 text-slate-600">
                      {new Date(user.createdAt).toLocaleDateString('az-AZ')}
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          user.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.status === 'active' ? 'Aktiv' : 'Deaktiv'}
                      </span>
                    </td>

                    <td className="p-3.5 text-right">
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleUserStatus(user.id)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition-colors ${
                            user.status === 'active'
                              ? 'border-red-200 text-red-700 hover:bg-red-50'
                              : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          {user.status === 'active' ? 'Deaktiv Et' : 'Aktivləşdir'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: VACANCIES MODERATION TABLE */}
      {/* ============================================================== */}
      {activeTab === 'vacancies' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Vakansiya və ya şirkət axtar..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-hidden focus:bg-white focus:border-blue-600 text-xs"
              />
            </div>
            <span className="text-slate-500 font-medium">
              Göstərilir: <span className="font-bold text-slate-900">{filteredVacancies.length}</span> elan
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-800">
                <tr>
                  <th className="p-3.5">Vakansiya & Şirkət</th>
                  <th className="p-3.5">Kateqoriya</th>
                  <th className="p-3.5">Maaş</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Featured</th>
                  <th className="p-3.5 text-right">Əməliyyatlar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVacancies.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={job.companyLogo}
                          alt={job.companyName}
                          className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{job.title}</div>
                          <div className="text-[11px] text-slate-500">{job.companyName} • {job.city}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-medium">
                        {job.category}
                      </span>
                    </td>

                    <td className="p-3.5 font-bold text-blue-700">
                      {job.minSalary} - {job.maxSalary} {job.currency}
                    </td>

                    <td className="p-3.5">
                      {job.isApproved !== false ? (
                        <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          ✓ Dərc edilib
                        </span>
                      ) : (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          ⏳ Gözləmədə
                        </span>
                      )}
                    </td>

                    <td className="p-3.5">
                      <button
                        onClick={() => onToggleFeatureVacancy(job.id)}
                        className={`p-1.5 rounded-lg border text-xs font-medium transition-all flex items-center gap-1 ${
                          job.isFeatured
                            ? 'bg-amber-50 border-amber-300 text-amber-800 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <Star className="w-3.5 h-3.5" fill={job.isFeatured ? 'currentColor' : 'none'} />
                        <span>{job.isFeatured ? 'Önə Çıxarılıb' : 'Standart'}</span>
                      </button>
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {job.isApproved === false ? (
                          <button
                            onClick={() => onApproveVacancy(job.id)}
                            className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                            title="Təsdiqlə"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => onRejectVacancy(job.id)}
                            className="p-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-md transition-colors"
                            title="Dərcdən çıxar"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => {
                            if (window.confirm('Vakansiyanı həmişəlik silmək istəyirsiniz?')) {
                              onDeleteVacancy(job.id);
                            }
                          }}
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-md border border-red-200 transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: COMPANIES MANAGEMENT */}
      {/* ============================================================== */}
      {activeTab === 'companies' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 font-bold text-xs text-slate-800">
            Qeydiyyatdan Keçmiş Bizneslər və Şirkətlər
          </div>

          <div className="divide-y divide-slate-100">
            {companies.map((comp) => {
              const count = vacancies.filter((v) => v.companyId === comp.id).length;

              return (
                <div key={comp.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={comp.logo}
                      alt={comp.name}
                      className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">{comp.name}</h4>
                        {comp.verified && (
                          <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            ✓ Təsdiqlənmiş
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500">{comp.industry} • {comp.location} • {comp.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-md">
                      {count} Aktiv Vakansiya
                    </span>

                    <button
                      onClick={() => onToggleCompanyVerified(comp.id)}
                      className={`px-3 py-1.5 rounded-lg font-medium border transition-colors cursor-pointer ${
                        comp.verified
                          ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                          : 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700 shadow-xs'
                      }`}
                    >
                      {comp.verified ? 'Verifikasiyanı Ləğv Et' : 'Şirkəti Təsdiqlə (Verify)'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: APPLICATIONS LOG */}
      {/* ============================================================== */}
      {activeTab === 'applications' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 font-bold text-xs text-slate-800">
            Platformada Edilmiş Bütün Müraciətlər ({applications.length})
          </div>

          <div className="divide-y divide-slate-100">
            {applications.map((app) => (
              <div key={app.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{app.candidateName}</span>
                    <span className="text-slate-400">→</span>
                    <span className="font-bold text-blue-700">{app.vacancyTitle}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Şirkət: <span className="font-semibold text-slate-700">{app.companyName}</span> • Tarix: {app.appliedDate} • Email: {app.candidateEmail}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {app.matchScore && (
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {app.matchScore}% Uyğunluq
                    </span>
                  )}
                  <span className="bg-slate-100 font-medium text-slate-800 px-3 py-1 rounded-full border border-slate-200 text-xs">
                    {app.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
