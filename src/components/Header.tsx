import React, { useState, useRef, useEffect } from 'react';
import { UserRole, User, UserSubscription } from '../types';
import { JobiaLogo } from './JobiaLogo';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { 
  Briefcase, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  Building2, 
  ShieldCheck, 
  User as UserIcon, 
  Search, 
  Plus, 
  TrendingUp, 
  MessageSquare,
  CreditCard,
  LogIn,
  LogOut,
  ChevronDown,
  Zap,
  Flame,
  UserPlus,
  Calculator
} from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange?: (role: UserRole) => void;
  setRole?: (role: UserRole) => void;
  candidateTab?: 'jobs' | 'cv-builder' | 'cv-analyzer' | 'my-applications' | 'salary-trends' | 'calculia' | 'google-chat';
  activeCandidateTab?: 'jobs' | 'cv-builder' | 'cv-analyzer' | 'my-applications' | 'salary-trends' | 'calculia' | 'google-chat';
  onCandidateTabChange?: (tab: 'jobs' | 'cv-builder' | 'cv-analyzer' | 'my-applications' | 'salary-trends' | 'calculia' | 'google-chat') => void;
  setActiveCandidateTab?: (tab: 'jobs' | 'cv-builder' | 'cv-analyzer' | 'my-applications' | 'salary-trends' | 'calculia' | 'google-chat') => void;
  applicationsCount?: number;
  activeVacanciesCount?: number;
  pendingApprovalsCount?: number;
  savedJobsCount?: number;
  onOpenGoogleChat?: () => void;
  onPostJobClick?: () => void;
  // Auth & Subscription additions
  currentUser: User | null;
  currentSubscription: UserSubscription | null;
  onOpenAuthModal: (mode?: 'login' | 'register', role?: UserRole) => void;
  onOpenPricing: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  setRole,
  candidateTab,
  activeCandidateTab,
  onCandidateTabChange,
  setActiveCandidateTab,
  applicationsCount = 0,
  activeVacanciesCount = 0,
  pendingApprovalsCount = 0,
  savedJobsCount = 0,
  onOpenGoogleChat,
  onPostJobClick,
  currentUser,
  currentSubscription,
  onOpenAuthModal,
  onOpenPricing,
  onLogout,
}) => {
  const { dict, brandAcronym, language } = useLanguage();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleChange = (role: UserRole) => {
    if (onRoleChange) onRoleChange(role);
    else if (setRole) setRole(role);
  };

  const activeTab = activeCandidateTab || candidateTab || 'jobs';
  const handleTabChange = (tab: 'jobs' | 'cv-builder' | 'cv-analyzer' | 'my-applications' | 'salary-trends' | 'calculia' | 'google-chat') => {
    if (onCandidateTabChange) onCandidateTabChange(tab);
    else if (setActiveCandidateTab) setActiveCandidateTab(tab);
  };

  const planTier = currentSubscription?.tier || 'FREE';
  const isPaidPlan = planTier !== 'FREE';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 w-full max-w-full shadow-2xs">
      <div className="w-full max-w-full px-3 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-1.5 sm:gap-2">
          {/* Brand Logo & Slogan Acronym Badge */}
          <div 
            onClick={() => {
              handleRoleChange('candidate');
              handleTabChange('jobs');
            }}
            className="flex items-center gap-2.5 shrink-0 min-w-0 cursor-pointer select-none group"
            title="jobia.az — Job Intelligence & Automation"
          >
            <JobiaLogo size="md" className="scale-90 sm:scale-100 origin-left group-hover:opacity-90 transition-opacity" />
            <div className="hidden lg:flex flex-col pl-2.5 border-l border-slate-200">
              <span className="text-[9px] font-black tracking-wider text-emerald-700 uppercase leading-none">
                {brandAcronym}
              </span>
              <span className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
                AI Smart Recruitment
              </span>
            </div>
          </div>

          {/* Candidate Navigation Tabs in Sleek Interface theme */}
          {currentRole === 'candidate' && (
            <nav className="hidden md:flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200/80 text-xs">
              <button
                onClick={() => handleTabChange('jobs')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium text-xs transition-colors cursor-pointer ${
                  activeTab === 'jobs'
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>{dict.nav.jobs}</span>
              </button>

              <button
                onClick={() => handleTabChange('cv-builder')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium text-xs transition-colors cursor-pointer ${
                  activeTab === 'cv-builder'
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{dict.nav.cvBuilder}</span>
              </button>

              <button
                onClick={() => handleTabChange('cv-analyzer')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium text-xs transition-colors cursor-pointer ${
                  activeTab === 'cv-analyzer'
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>{dict.nav.cvAnalyzer}</span>
              </button>

              <button
                onClick={() => handleTabChange('salary-trends')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium text-xs transition-colors cursor-pointer ${
                  activeTab === 'salary-trends'
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                <span>{dict.nav.salaryTrends}</span>
              </button>

              <button
                onClick={() => handleTabChange('my-applications')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium text-xs transition-colors cursor-pointer ${
                  activeTab === 'my-applications'
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                <span>{dict.nav.myApplications}</span>
                {applicationsCount > 0 && (
                  <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                    {applicationsCount}
                  </span>
                )}
              </button>

              <button
                id="header-tab-google-chat"
                onClick={() => {
                  if (onOpenGoogleChat) onOpenGoogleChat();
                  else handleTabChange('google-chat');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium text-xs transition-colors cursor-pointer ${
                  activeTab === 'google-chat'
                    ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/50'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>{dict.nav.googleChat}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </button>
            </nav>
          )}

          {/* Right Controls: Language Selector, Pricing, Role Switcher & Auth */}
          <div className="flex items-center gap-2">
            {/* Multilingual Switcher (AZ / EN / RU) */}
            <LanguageSwitcher />

            {/* Post Job Button (Corporate Highlight) */}
            <button
              id="header-post-job-btn"
              onClick={() => {
                if (onPostJobClick) {
                  onPostJobClick();
                } else {
                  handleRoleChange('business');
                }
              }}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs hover:shadow-sm transition-all cursor-pointer select-none active:scale-98"
              title="Yeni vakansiya elanı yerləşdir"
            >
              <Plus className="w-4 h-4" />
              <span className="font-extrabold">{language === 'en' ? 'Post a Job' : language === 'ru' ? 'Разместить вакансию' : 'Elan yerləşdir'}</span>
            </button>

            {/* Pricing Page Button */}
            <button
              id="header-pricing-btn"
              onClick={onOpenPricing}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{dict.nav.pricing}</span>
            </button>

            {/* Role Switcher */}
            <div className="hidden sm:flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
              <button
                id="role-btn-candidate"
                onClick={() => handleRoleChange('candidate')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  currentRole === 'candidate'
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>{dict.nav.candidate}</span>
              </button>

              <button
                id="role-btn-business"
                onClick={() => handleRoleChange('business')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  currentRole === 'business'
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>{dict.nav.employer}</span>
                <span className="text-[10px] opacity-75">({activeVacanciesCount})</span>
              </button>

              <button
                id="role-btn-admin"
                onClick={() => handleRoleChange('admin')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all relative cursor-pointer ${
                  currentRole === 'admin'
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>{dict.nav.admin}</span>
                {pendingApprovalsCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-blue-500 ring-2 ring-white"></span>
                )}
              </button>
            </div>

            {/* AUTH & USER PROFILE SECTION */}
            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  id="user-profile-menu-btn"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1 pl-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer"
                >
                  <div className="text-left hidden md:block">
                    <div className="text-xs font-bold text-slate-900 leading-tight">
                      {currentUser.fullName}
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1">
                      <span>{currentUser.role === 'business' ? dict.nav.employer : currentUser.role === 'admin' ? dict.nav.admin : dict.nav.candidate}</span>
                      <span>•</span>
                      <span className={`font-black ${isPaidPlan ? 'text-blue-600' : 'text-slate-600'}`}>
                        {planTier}
                      </span>
                    </div>
                  </div>

                  <img
                    src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.fullName}`}
                    alt={currentUser.fullName}
                    className="w-7 h-7 rounded-lg object-cover border border-slate-200"
                  />
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 mr-1" />
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-fade-in text-xs">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <div className="font-bold text-slate-900">{currentUser.fullName}</div>
                      <div className="text-slate-500 text-[11px] truncate">{currentUser.email}</div>
                      <div className="mt-1.5 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">{dict.nav.currentPlan}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          isPaidPlan ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {planTier}
                        </span>
                      </div>
                    </div>

                    {!isPaidPlan && (
                      <div className="p-2 border-b border-slate-100">
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            onOpenPricing();
                          }}
                          className="w-full py-1.5 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-xs hover:from-blue-700 hover:to-indigo-700 transition-all cursor-pointer"
                        >
                          <Flame className="w-3.5 h-3.5 text-amber-300" />
                          <span>{dict.nav.upgradePlan}</span>
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onOpenPricing();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4 text-slate-400" />
                      <span>{dict.nav.subscriptionsAndPlans}</span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2 transition-colors cursor-pointer border-t border-slate-100 mt-1"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>{dict.nav.logout}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Non-authenticated user login/register buttons */
              <div className="flex items-center gap-1.5">
                <button
                  id="header-login-btn"
                  onClick={() => onOpenAuthModal('login', currentRole)}
                  className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{dict.nav.login}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation for candidate tabs */}
        {currentRole === 'candidate' && (
          <div className="md:hidden flex items-center justify-between overflow-x-auto py-2 border-t border-slate-100 text-xs font-medium gap-1 scrollbar-none">
            <button
              onClick={() => handleTabChange('jobs')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
                activeTab === 'jobs' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600'
              }`}
            >
              {dict.nav.jobs}
            </button>
            <button
              onClick={() => handleTabChange('salary-trends')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
                activeTab === 'salary-trends' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600'
              }`}
            >
              {dict.nav.salaryTrends}
            </button>
            <button
              onClick={() => handleTabChange('cv-builder')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
                activeTab === 'cv-builder' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600'
              }`}
            >
              {dict.nav.cvBuilder}
            </button>
            <button
              onClick={() => handleTabChange('cv-analyzer')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
                activeTab === 'cv-analyzer' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600'
              }`}
            >
              {dict.nav.cvAnalyzer}
            </button>
            <button
              onClick={() => handleTabChange('my-applications')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
                activeTab === 'my-applications' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600'
              }`}
            >
              {dict.nav.myApplications} ({applicationsCount})
            </button>
            <button
              onClick={() => {
                if (onOpenGoogleChat) onOpenGoogleChat();
                else handleTabChange('google-chat');
              }}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1 ${
                activeTab === 'google-chat' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-600'
              }`}
            >
              <MessageSquare className="w-3 h-3 text-emerald-600" />
              <span>{dict.nav.googleChat}</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

