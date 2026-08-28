import React from 'react';
import { JobiaLogo } from './JobiaLogo';
import { UserRole } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { 
  Briefcase, 
  Sparkles, 
  FileText, 
  TrendingUp, 
  ShieldCheck, 
  Heart, 
  CheckCircle, 
  MessageSquare,
  Building2,
  Lock,
  Zap,
  ArrowUpRight,
  Calculator,
  Palmtree
} from 'lucide-react';

interface FooterProps {
  currentRole: UserRole;
  onNavigateCandidateTab?: (tab: 'jobs' | 'cv-builder' | 'cv-analyzer' | 'my-applications' | 'salary-trends' | 'calculia' | 'google-chat') => void;
  onRoleChange?: (role: UserRole) => void;
  onOpenPricing?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  currentRole,
  onNavigateCandidateTab,
  onRoleChange,
  onOpenPricing,
}) => {
  const { dict, brandAcronym, brandAcronymFull, language } = useLanguage();

  return (
    <footer className="w-full max-w-full overflow-hidden bg-white border-t border-slate-200 mt-16 text-slate-700">
      {/* Slogan & Hero Banner in Footer */}
      <div className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          
          {/* Prominent Large Brand Logo */}
          <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200/80 inline-flex items-center justify-center mb-4 hover:shadow-md transition-all duration-300">
            <JobiaLogo size="2xl" className="scale-95 sm:scale-105" />
          </div>

          {/* Acronym Brand Explanation Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black tracking-wide mb-3 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>{dict.footer.acronymShowcase}</span>
          </div>

          {/* Sweet Primary Slogan */}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-snug">
            {dict.brand.heroHeadline}
          </h2>

          {/* Sweet Subtitle with localized explanation */}
          <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {dict.brand.heroSubtitle}
          </p>

          {/* Feature Trust Pills */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-semibold text-slate-700">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 shadow-2xs">
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              {dict.hero.pillFree}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              {dict.hero.pillAICV}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-2xs">
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              {dict.hero.pillOfferPortal}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200 shadow-2xs">
              <Lock className="w-3.5 h-3.5 text-slate-600" />
              {dict.hero.pillSecure}
            </span>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Information */}
      <div className="w-full max-w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          
          {/* Col 1: Platform About */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <JobiaLogo size="sm" />
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              {dict.footer.aboutText}
            </p>
            <div className="pt-2 text-xs text-slate-600 font-medium space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{dict.footer.dailyVacancies}</span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                {brandAcronymFull}
              </div>
            </div>
            <div className="pt-2">
              <LanguageSwitcher variant="buttons" />
            </div>
          </div>

          {/* Col 2: Candidates */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              {dict.footer.forCandidates}
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onRoleChange) onRoleChange('candidate');
                    if (onNavigateCandidateTab) onNavigateCandidateTab('jobs');
                  }}
                  className="hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer text-left"
                >
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span>{dict.footer.allVacancies}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onRoleChange) onRoleChange('candidate');
                    if (onNavigateCandidateTab) onNavigateCandidateTab('cv-builder');
                  }}
                  className="hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer text-left"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>{dict.footer.createCV}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onRoleChange) onRoleChange('candidate');
                    if (onNavigateCandidateTab) onNavigateCandidateTab('cv-analyzer');
                  }}
                  className="hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer text-left"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  <span>{dict.footer.cvAnalysis}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onRoleChange) onRoleChange('candidate');
                    if (onNavigateCandidateTab) onNavigateCandidateTab('salary-trends');
                  }}
                  className="hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer text-left"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
                  <span>{dict.footer.salaryMarket}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  id="footer-nav-salaria"
                  onClick={() => {
                    if (onRoleChange) onRoleChange('candidate');
                    if (onNavigateCandidateTab) onNavigateCandidateTab('calculia');
                  }}
                  className="hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer text-left font-semibold text-slate-800 hover:text-blue-700"
                >
                  <Calculator className="w-3.5 h-3.5 text-blue-600" />
                  <span>Salaria & Vacatia (2026)</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Employers */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              {dict.footer.forEmployers}
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onRoleChange) onRoleChange('business');
                  }}
                  className="hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer text-left"
                >
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{dict.nav.employer}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onRoleChange) onRoleChange('business');
                  }}
                  className="hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer text-left"
                >
                  <Zap className="w-3.5 h-3.5 text-slate-400" />
                  <span>{dict.footer.postJob}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onRoleChange) onRoleChange('business');
                  }}
                  className="hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer text-left"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>{dict.hero.pillOfferPortal}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenPricing) onOpenPricing();
                  }}
                  className="hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer text-left"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{dict.footer.pricingPlans}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Communication & Trust */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              {dict.footer.contact}
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{language === 'en' ? 'Labor Legislation Compliant' : language === 'ru' ? 'В соответствии с законодательством' : 'AR Əmək Qanunvericiliyinə Uyğun'}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>256-Bit SSL</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                <span>Google Chat Workspace</span>
              </li>
              <li className="pt-1">
                <span className="text-[11px] text-slate-500">
                  {dict.footer.supportEmail}
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">jobia.az</span>
            <span>—</span>
            <span>{dict.footer.rights}</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <span>{dict.brand.slogan}</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

