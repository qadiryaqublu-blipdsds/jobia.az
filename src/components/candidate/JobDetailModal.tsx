import React, { useState } from 'react';
import { Vacancy, CVData } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { 
  X, 
  Building2, 
  MapPin, 
  Clock, 
  Briefcase, 
  DollarSign, 
  CheckCircle, 
  Calendar, 
  Share2, 
  Sparkles, 
  FileText,
  Send,
  MessageSquare,
  Bookmark,
  StickyNote,
  Save,
  Check
} from 'lucide-react';

interface JobDetailModalProps {
  vacancy: Vacancy | null;
  onClose: () => void;
  savedCV: CVData;
  onApply: (vacancy: Vacancy, coverNote: string, cvData: CVData) => void;
  hasApplied: boolean;
  jobNote?: string;
  onSaveJobNote?: (note: string) => void;
  isSaved?: boolean;
  onToggleBookmark?: () => void;
  onOpenInterviewPrep: (vacancy: Vacancy) => void;
  onOpenCVAnalyzerForJob: (vacancy: Vacancy) => void;
  onShareToGoogleChat?: (vacancy: Vacancy) => void;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  vacancy,
  onClose,
  savedCV,
  onApply,
  hasApplied,
  jobNote = '',
  onSaveJobNote,
  isSaved = false,
  onToggleBookmark,
  onOpenInterviewPrep,
  onOpenCVAnalyzerForJob,
  onShareToGoogleChat,
}) => {
  const { dict, language } = useLanguage();
  if (!vacancy) return null;

  const [isApplying, setIsApplying] = useState(false);
  const [coverNote, setCoverNote] = useState('');
  const [copied, setCopied] = useState(false);
  const [currentNote, setCurrentNote] = useState(jobNote);
  const [isNoteSaved, setIsNoteSaved] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveNote = () => {
    if (onSaveJobNote) {
      onSaveJobNote(currentNote);
      setIsNoteSaved(true);
      setTimeout(() => setIsNoteSaved(false), 2000);
    }
  };

  const submitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    onApply(vacancy, coverNote, savedCV);
    setIsApplying(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fade-in">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[96vh] sm:max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-3">
          <div className="flex flex-col xs:flex-row items-start gap-3 sm:gap-4 flex-1 min-w-0">
            <img
              src={vacancy.companyLogo}
              alt={vacancy.companyName}
              className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl object-cover border border-slate-200 bg-white shrink-0 shadow-xs"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/80">
                  {vacancy.category}
                </span>
                {vacancy.isFeatured && (
                  <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                    {dict.jobExplorer.featured}
                  </span>
                )}
                <span className="bg-green-100 text-green-700 text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {language === 'en' ? 'ACTIVE' : language === 'ru' ? 'АКТИВНО' : 'AKTİV'}
                </span>
              </div>
              <h2 className="text-base sm:text-xl md:text-2xl font-bold text-slate-900 mt-1 leading-tight break-words">{vacancy.title}</h2>
              <div className="flex flex-wrap items-center gap-y-1 gap-x-3 sm:gap-x-4 text-[11px] sm:text-xs text-slate-600 mt-1.5 sm:mt-2 font-medium">
                <span className="flex items-center gap-1 font-bold text-slate-800">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{vacancy.companyName}</span>
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {vacancy.city}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {vacancy.employmentType}
                </span>
                <span className="flex items-center gap-1 text-blue-700 font-bold">
                  <DollarSign className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  {vacancy.hideSalary
                    ? (language === 'en' ? 'Negotiable' : language === 'ru' ? 'По договоренности' : 'Müsahibə əsasında')
                    : `${vacancy.minSalary} - ${vacancy.maxSalary} ${vacancy.currency}`}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onToggleBookmark && (
              <button
                onClick={onToggleBookmark}
                className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                  isSaved
                    ? 'bg-amber-50 border-amber-200 text-amber-500'
                    : 'border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                }`}
                title={isSaved ? dict.jobExplorer.saved : dict.jobExplorer.saveJob}
              >
                <Bookmark className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 text-xs sm:text-sm">
          {/* Quick AI Action Cards for Candidates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => {
                onClose();
                onOpenCVAnalyzerForJob(vacancy);
              }}
              className="flex items-center gap-3 p-3.5 rounded-lg bg-blue-50/70 border border-blue-200/80 text-left hover:bg-blue-100/60 transition-all group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles className="w-4 h-4 group-hover:scale-105 transition-transform" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">
                  {language === 'en' ? 'Match My CV to this Job' : language === 'ru' ? 'Адаптировать резюме под вакансию' : 'CV-mi bu vakansiyaya uyğunlaşdır'}
                </div>
                <div className="text-[11px] text-blue-700">
                  {language === 'en' ? 'Check ATS score and keywords with AI' : language === 'ru' ? 'Проверить ATS скор и ключевые слова с ИИ' : 'AI ilə açar söz və uyğunluq faizini yoxla'}
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenInterviewPrep(vacancy);
              }}
              className="flex items-center gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-left hover:bg-slate-100 transition-all group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs">
                <FileText className="w-4 h-4 group-hover:scale-105 transition-transform" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">{dict.jobDetail.interviewPrep}</div>
                <div className="text-[11px] text-slate-600">
                  {language === 'en' ? 'Expected interview questions and answers' : language === 'ru' ? 'Ожидаемые вопросы и ответы для собеседования' : 'Bu vəzifə üçün gözlənilən suallar və cavablar'}
                </div>
              </div>
            </button>
          </div>

          {/* PERSONAL CANDIDATE NOTES BOX */}
          {onSaveJobNote && (
            <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <StickyNote className="w-4 h-4 text-amber-600" />
                  <span>{dict.jobExplorer.addNote}</span>
                </div>
                <button
                  type="button"
                  onClick={handleSaveNote}
                  className="flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                >
                  {isNoteSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{isNoteSaved ? (language === 'en' ? 'Saved' : language === 'ru' ? 'Сохранено' : 'Saxlanıldı') : dict.jobExplorer.saveNote}</span>
                </button>
              </div>
              <textarea
                rows={2}
                value={currentNote}
                onChange={(e) => setCurrentNote(e.target.value)}
                placeholder={language === 'en' ? 'Personal note about this vacancy...' : language === 'ru' ? 'Личная заметка о вакансии...' : 'Bu vakansiya haqqında şəxsi qeydiniz...'}
                className="w-full text-xs p-2.5 rounded-lg border border-amber-200 bg-white focus:border-amber-500 focus:outline-none resize-none leading-relaxed"
              />
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              {language === 'en' ? 'Job Description' : language === 'ru' ? 'Описание вакансии' : 'Vakansiya Haqqında'}
            </h3>
            <p className="text-slate-700 leading-relaxed whitespace-pre-line text-xs sm:text-sm">{vacancy.description}</p>
          </div>

          {/* Responsibilities */}
          {vacancy.responsibilities && vacancy.responsibilities.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                {language === 'en' ? 'Responsibilities' : language === 'ru' ? 'Обязанности' : 'Vəzifə Öhdəlikləri'}
              </h3>
              <ul className="space-y-1.5 list-disc list-inside text-slate-700 text-xs sm:text-sm">
                {vacancy.responsibilities.map((resp, idx) => (
                  <li key={idx} className="leading-relaxed">
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements */}
          {vacancy.requirements && vacancy.requirements.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                {language === 'en' ? 'Requirements' : language === 'ru' ? 'Требования к кандидату' : 'Namizədə Tələblər'}
              </h3>
              <ul className="space-y-1.5 list-disc list-inside text-slate-700 text-xs sm:text-sm">
                {vacancy.requirements.map((req, idx) => (
                  <li key={idx} className="leading-relaxed">
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Benefits */}
          {vacancy.benefits && vacancy.benefits.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                {language === 'en' ? 'Benefits & Perks' : language === 'ru' ? 'Условия и преимущества' : 'Təminatlar və Üstünlüklər'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {vacancy.benefits.map((ben, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs text-slate-800">
                    <CheckCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>{ben}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills Required */}
          {vacancy.skills && vacancy.skills.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                {language === 'en' ? 'Required Skills' : language === 'ru' ? 'Требуемые навыки' : 'Tələb Olunan Bacarıqlar'}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {vacancy.skills.map((skill, idx) => (
                  <span key={idx} className="text-xs font-medium bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md border border-slate-200">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Meta dates */}
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{language === 'en' ? 'Posted' : language === 'ru' ? 'Дата публикации' : 'Elan tarixi'}: {vacancy.postedDate}</span>
              <span className="mx-1">•</span>
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <span className="font-semibold text-slate-700">{dict.jobExplorer.deadline} {vacancy.deadline}</span>
            </div>
            <div className="flex items-center gap-3">
              <span>{vacancy.viewsCount} {dict.jobExplorer.sortViews}</span>
              <span>{vacancy.applicantsCount} {language === 'en' ? 'applicants' : language === 'ru' ? 'откликов' : 'müraciət'}</span>
            </div>
          </div>
        </div>

        {/* Apply Flow Drawer / Form */}
        {isApplying ? (
          <form onSubmit={submitApplication} className="p-5 bg-slate-50 border-t border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-900">
                  {language === 'en' ? 'Application Form' : language === 'ru' ? 'Форма отклика' : 'Müraciət Formu'}: {savedCV.personalInfo.fullName || 'Namizəd'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsApplying(false)}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
              >
                {language === 'en' ? 'Cancel' : language === 'ru' ? 'Отмена' : 'Ləğv et'}
              </button>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">{savedCV.personalInfo.fullName || (language === 'en' ? 'My CV' : language === 'ru' ? 'Мое резюме' : 'Mənim CV-im')}</div>
                <div className="text-[11px] text-slate-500">{savedCV.personalInfo.email} • {savedCV.personalInfo.phone}</div>
              </div>
              <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">
                {language === 'en' ? 'Active CV attached' : language === 'ru' ? 'Прикреплено резюме' : 'Aktiv CV qoşuldu'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'en' ? 'Cover Note to Employer (Optional)' : language === 'ru' ? 'Сопроводительное письмо работодателю (Опционально)' : 'İşəgötürənə Qeyd / Müşayiət Məktubu (İxtiyari)'}
              </label>
              <textarea
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
                placeholder={language === 'en' ? 'Hello, I believe my experience will be valuable for your team...' : language === 'ru' ? 'Здравствуйте, уверен, что мой опыт принесет пользу вашей компании...' : 'Salam, bu vakansiya üzrə təcrübəmin şirkətiniz üçün faydalı olacağına inanıram...'}
                rows={2}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none resize-none bg-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{language === 'en' ? 'Confirm & Send Application' : language === 'ru' ? 'Подтвердить и отправить отклик' : 'Müraciəti Təsdiqlə və Göndər'}</span>
            </button>
          </form>
        ) : (
          /* Footer Action Bar */
          <div className="p-4 sm:p-5 border-t border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-xs font-medium flex items-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>{copied ? (language === 'en' ? 'Link copied!' : language === 'ru' ? 'Ссылка скопирована!' : 'Link kopyalandı!') : (language === 'en' ? 'Share' : language === 'ru' ? 'Поделиться' : 'Bölüş')}</span>
              </button>

              {onShareToGoogleChat && (
                <button
                  onClick={() => onShareToGoogleChat(vacancy)}
                  className="p-2 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-colors text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  title="Google Chat"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span className="hidden sm:inline">Google Chat</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {hasApplied ? (
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>{language === 'en' ? 'You have already applied to this job' : language === 'ru' ? 'Вы уже откликнулись на эту вакансию' : 'Siz bu vakansiyaya artıq müraciət etmisiniz'}</span>
                </div>
              ) : (
                <button
                  id="btn-apply-job"
                  onClick={() => setIsApplying(true)}
                  className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{dict.jobExplorer.applyNow}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

