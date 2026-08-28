import React, { useState } from 'react';
import { Vacancy, Application, Company, ApplicationStatus, JobOffer, JobOfferTemplate, OfferAuditLog } from '../../types';
import { CVRenderer } from '../cv-templates/CVRenderer';
import { downloadCVAsPDF, generateCVFileName } from '../../utils/pdfExport';
import { JobOffersTable } from '../interview-offer/JobOffersTable';
import { InterviewModal } from '../interview-offer/InterviewModal';
import { JobOfferTemplatesModal } from '../interview-offer/JobOfferTemplatesModal';
import { OfferAuditLogModal } from '../interview-offer/OfferAuditLogModal';
import { 
  Building2, 
  Plus, 
  Briefcase, 
  Users, 
  Sparkles, 
  ChevronRight, 
  Filter, 
  FileText, 
  X, 
  CheckCircle, 
  Download, 
  Loader2, 
  MessageSquare,
  Award,
  Send,
  Sliders,
  ShieldCheck,
  History,
  CheckCircle2
} from 'lucide-react';

interface BusinessDashboardProps {
  companies: Company[];
  activeCompany: Company;
  setActiveCompany: (c: Company) => void;
  vacancies: Vacancy[];
  applications: Application[];
  offers: JobOffer[];
  auditLogs: OfferAuditLog[];
  templates: JobOfferTemplate[];
  onOpenPostJobModal: () => void;
  onUpdateApplicationStatus: (appId: string, status: ApplicationStatus, notes?: string) => void;
  onDeleteJob: (jobId: string) => void;
  onSaveOffer: (offer: JobOffer, log: OfferAuditLog) => void;
  onUpdateOfferStatus: (offerId: string, status: any, reason?: any, log?: OfferAuditLog) => void;
  onUpdateTemplates: (templates: JobOfferTemplate[]) => void;
  onUpdateCompany: (company: Company) => void;
  onOpenCandidatePortal: (offer: JobOffer) => void;
  onShareToGoogleChat?: (applicant: Application) => void;
}

export const BusinessDashboard: React.FC<BusinessDashboardProps> = ({
  companies,
  activeCompany,
  setActiveCompany,
  vacancies,
  applications,
  offers,
  auditLogs,
  templates,
  onOpenPostJobModal,
  onUpdateApplicationStatus,
  onDeleteJob,
  onSaveOffer,
  onUpdateOfferStatus,
  onUpdateTemplates,
  onUpdateCompany,
  onOpenCandidatePortal,
  onShareToGoogleChat,
}) => {
  const [activeTab, setActiveTab] = useState<'vacancies' | 'applicants' | 'offers' | 'templates' | 'company-profile'>('vacancies');
  const [selectedApplicant, setSelectedApplicant] = useState<Application | null>(null);
  const [filterVacancyId, setFilterVacancyId] = useState<string>('all');
  const [recruiterNotesInput, setRecruiterNotesInput] = useState('');
  const [selectedNewStatus, setSelectedNewStatus] = useState<ApplicationStatus>('Baxıldı');
  const [isDownloadingApplicantPDF, setIsDownloadingApplicantPDF] = useState(false);

  // Workflow Modals
  const [activeInterviewApp, setActiveInterviewApp] = useState<Application | null>(null);
  const [editingOffer, setEditingOffer] = useState<JobOffer | undefined>(undefined);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [selectedAuditLogOffer, setSelectedAuditLogOffer] = useState<{ id: string; name: string } | null>(null);

  // Company specific data
  const companyJobs = vacancies.filter((v) => v.companyId === activeCompany.id);
  const companyApplications = applications.filter((a) => a.companyId === activeCompany.id);
  const companyOffers = offers.filter((o) => o.companyId === activeCompany.id);
  const companyLogs = auditLogs.filter((l) => companyOffers.some((o) => o.id === l.offerId));

  // Filtered applicants
  const filteredApplicants = companyApplications.filter((a) => {
    if (filterVacancyId !== 'all' && a.vacancyId !== filterVacancyId) return false;
    return true;
  });

  const handleOpenApplicantModal = (app: Application) => {
    setSelectedApplicant(app);
    setSelectedNewStatus(app.status);
    setRecruiterNotesInput(app.recruiterNotes || '');
  };

  const handleSaveApplicantStatus = () => {
    if (selectedApplicant) {
      onUpdateApplicationStatus(selectedApplicant.id, selectedNewStatus, recruiterNotesInput);
      setSelectedApplicant((prev) =>
        prev ? { ...prev, status: selectedNewStatus, recruiterNotes: recruiterNotesInput } : null
      );
    }
  };

  const handleStartInterviewWorkflow = (app: Application, existingOffer?: JobOffer) => {
    setActiveInterviewApp(app);
    setEditingOffer(existingOffer);
  };

  const handleToggleApprovalSetting = (enabled: boolean) => {
    const updated = { ...activeCompany, requireOfferApproval: enabled };
    setActiveCompany(updated);
    onUpdateCompany(updated);
  };

  return (
    <div className="space-y-6">
      {/* Top Company Header Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <img
            src={activeCompany.logo}
            alt={activeCompany.name}
            className="w-14 h-14 rounded-lg object-cover border border-slate-200 bg-white shrink-0 shadow-xs"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{activeCompany.name}</h1>
              {activeCompany.verified && (
                <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Təsdiqlənmiş Biznes
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">{activeCompany.industry} • {activeCompany.location}</p>

            {/* Quick company switcher for demo testing */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] text-slate-400 font-medium">Şirkət seç:</span>
              <select
                value={activeCompany.id}
                onChange={(e) => {
                  const comp = companies.find((c) => c.id === e.target.value);
                  if (comp) setActiveCompany(comp);
                }}
                className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-md px-2 py-0.5 outline-none"
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenPostJobModal}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-sm flex items-center gap-2 transition-colors self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Vakansiya Elan Et</span>
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500">Aktiv Elanlar</span>
            <h3 className="text-xl font-bold text-slate-900">{companyJobs.length}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500">Gələn Müraciətlər</span>
            <h3 className="text-xl font-bold text-slate-900">{companyApplications.length}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500">Müsahibə Mərhələsi</span>
            <h3 className="text-xl font-bold text-slate-900">
              {companyApplications.filter((a) => a.status === 'Müsahibəyə dəvət' || a.status === 'Baxıldı').length}
            </h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500">Verilən İş Təklifləri</span>
            <h3 className="text-xl font-bold text-emerald-700">{companyOffers.length}</h3>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-xs font-medium w-full sm:w-auto overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('vacancies')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'vacancies' ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Vakansiyalarım ({companyJobs.length})
        </button>

        <button
          onClick={() => setActiveTab('applicants')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'applicants' ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Gələn Müraciətlər ({companyApplications.length})
        </button>

        <button
          onClick={() => setActiveTab('offers')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'offers' ? 'bg-blue-600 text-white font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900 font-semibold'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Müsahibə & Təkliflər ({companyOffers.length})</span>
        </button>

        <button
          onClick={() => setIsTemplatesModalOpen(true)}
          className="px-3 py-1.5 rounded-md whitespace-nowrap transition-colors text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          <span>Offer Şablonları</span>
        </button>

        <button
          onClick={() => setActiveTab('company-profile')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'company-profile' ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Şirkət Tənzimləmələri
        </button>
      </div>

      {/* TAB 1: Company Vacancies */}
      {activeTab === 'vacancies' && (
        <div className="space-y-4">
          {companyJobs.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3 shadow-sm">
              <Briefcase className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">Şirkətinizin aktiv vakansiyası yoxdur</h3>
              <button
                onClick={onOpenPostJobModal}
                className="px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg shadow-sm"
              >
                İlk Vakansiyanı Yerləşdir
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {companyJobs.map((job) => {
                const jobApplicants = applications.filter((a) => a.vacancyId === job.id);

                return (
                  <div key={job.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {job.category}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 mt-1">{job.title}</h3>
                        <p className="text-xs text-blue-700 font-bold mt-0.5">
                          {job.minSalary} - {job.maxSalary} {job.currency}
                        </p>
                      </div>

                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                        AKTİV
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <span>Son müraciət: {job.deadline}</span>
                      <span className="font-semibold text-blue-600">{jobApplicants.length} Namizəd</span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => {
                          setFilterVacancyId(job.id);
                          setActiveTab('applicants');
                        }}
                        className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Müraciətləri Göstər ({jobApplicants.length})</span>
                      </button>

                      <button
                        onClick={() => {
                          if (window.confirm('Bu vakansiyanı silmək istədiyinizdən əminsiniz?')) {
                            onDeleteJob(job.id);
                          }
                        }}
                        className="text-xs text-red-500 hover:text-red-700 font-medium"
                      >
                        Vakansiyanı Sil
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Applicants list & screening */}
      {activeTab === 'applicants' && (
        <div className="space-y-4">
          {/* Filter by job */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="font-bold text-slate-700">Vakansiya üzrə filtrlə:</span>
              <select
                value={filterVacancyId}
                onChange={(e) => setFilterVacancyId(e.target.value)}
                className="p-1.5 bg-slate-50 border border-slate-200 rounded-md outline-none font-medium"
              >
                <option value="all">Bütün Vakansiyalar ({companyApplications.length})</option>
                {companyJobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title}
                  </option>
                ))}
              </select>
            </div>

            <span className="text-slate-500 font-medium">
              Cəmi: <span className="font-bold text-slate-900">{filteredApplicants.length}</span> namizəd
            </span>
          </div>

          {filteredApplicants.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 text-xs shadow-sm">
              Seçilmiş vakansiya üzrə müraciət tapılmadı.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredApplicants.map((app) => {
                const existingAppOffer = companyOffers.find((o) => o.applicationId === app.id || o.candidateEmail === app.candidateEmail);

                return (
                  <div
                    key={app.id}
                    className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div
                      onClick={() => handleOpenApplicantModal(app)}
                      className="space-y-1 cursor-pointer flex-1"
                    >
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">{app.candidateName}</h3>
                        {app.matchScore && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-blue-600" />
                            <span>{app.matchScore}% Uyğunluq</span>
                          </span>
                        )}
                        {existingAppOffer && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Offer: {existingAppOffer.status}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-blue-700 font-semibold">{app.vacancyTitle}</p>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                        <span>{app.candidateEmail}</span>
                        <span>•</span>
                        <span>{app.candidatePhone}</span>
                        <span>•</span>
                        <span>Müraciət: {app.appliedDate}</span>
                      </div>

                      {app.coverNote && (
                        <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-md mt-2 line-clamp-1 italic">
                          "{app.coverNote}"
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {/* One-Click Interview & Offer trigger */}
                      <button
                        onClick={() => handleStartInterviewWorkflow(app, existingAppOffer)}
                        className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                        title="AI Müsahibə dəyərləndirməsi və İş Təklifi hazırla"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                        <span>Müsahibə & Təklif</span>
                      </button>

                      <button
                        onClick={() => handleOpenApplicantModal(app)}
                        className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                      >
                        CV-yə Bax
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Job Offers Management */}
      {activeTab === 'offers' && (
        <JobOffersTable
          offers={companyOffers}
          auditLogs={companyLogs}
          onOpenOfferWorkflow={(offer) => {
            const app = companyApplications.find((a) => a.id === offer.applicationId || a.candidateEmail === offer.candidateEmail) || {
              id: offer.applicationId || `app-${Date.now()}`,
              vacancyId: '',
              vacancyTitle: offer.position,
              companyId: offer.companyId,
              companyName: offer.companyName,
              companyLogo: offer.companyLogo,
              candidateName: offer.candidateName,
              candidateEmail: offer.candidateEmail,
              candidatePhone: offer.candidatePhone,
              appliedDate: offer.createdAt.split('T')[0],
              status: 'Təklif verildi',
              cvData: {} as any,
            };
            handleStartInterviewWorkflow(app, offer);
          }}
          onOpenAuditLog={(offerId, name) => {
            setSelectedAuditLogOffer({ id: offerId, name });
          }}
          onResendOffer={(offer) => {
            const app = companyApplications.find((a) => a.id === offer.applicationId || a.candidateEmail === offer.candidateEmail) || {
              id: offer.applicationId || `app-${Date.now()}`,
              vacancyId: '',
              vacancyTitle: offer.position,
              companyId: offer.companyId,
              companyName: offer.companyName,
              companyLogo: offer.companyLogo,
              candidateName: offer.candidateName,
              candidateEmail: offer.candidateEmail,
              candidatePhone: offer.candidatePhone,
              appliedDate: offer.createdAt.split('T')[0],
              status: 'Təklif verildi',
              cvData: {} as any,
            };
            handleStartInterviewWorkflow(app, offer);
          }}
          onOpenCandidatePortal={onOpenCandidatePortal}
        />
      )}

      {/* TAB 4: Company Profile & Approval Settings */}
      {activeTab === 'company-profile' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm max-w-3xl space-y-6 text-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Şirkət Tənzimləmələri və HR Qaydaları</h3>
            <p className="text-slate-500 mt-0.5">
              İş təklifləri, təsdiq prosesləri və əlaqə məlumatlarının idarə olunması.
            </p>
          </div>

          {/* Offer Approval toggle */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <h4 className="font-bold text-slate-900">
                  İş Təklifləri Göndərilməzdən Əvvəl Rəhbərlik Təsdiqi Tələb Olunsun
                </h4>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Aktiv olduqda, HR əməkdaşının hazırladığı iş təklifi (Job Offer) birbaşa namizədə göndərilmir, əvvəlcə rəhbər tərəfindən təsdiq (Approval) gözləyir.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={activeCompany.requireOfferApproval || false}
                onChange={(e) => handleToggleApprovalSetting(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Şirkət Adı</label>
                <input
                  type="text"
                  readOnly
                  value={activeCompany.name}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Fəaliyyət Sahəsi</label>
                <input
                  type="text"
                  readOnly
                  value={activeCompany.industry}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">HR Əlaqədar Şəxs</label>
                <input
                  type="text"
                  value={activeCompany.hrContactName || 'HR Meneceri'}
                  onChange={(e) => {
                    const updated = { ...activeCompany, hrContactName: e.target.value };
                    setActiveCompany(updated);
                    onUpdateCompany(updated);
                  }}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">HR Vəzifəsi</label>
                <input
                  type="text"
                  value={activeCompany.hrContactPosition || 'İnsan Resursları Departamenti'}
                  onChange={(e) => {
                    const updated = { ...activeCompany, hrContactPosition: e.target.value };
                    setActiveCompany(updated);
                    onUpdateCompany(updated);
                  }}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Ünvan</label>
              <input
                type="text"
                readOnly
                value={activeCompany.location}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Haqqında</label>
              <textarea
                rows={3}
                readOnly
                value={activeCompany.description}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg resize-none text-slate-800"
              />
            </div>
          </div>
        </div>
      )}

      {/* Candidate CV & Review Drawer/Modal */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="bg-white w-full max-w-4xl rounded-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Müraciət İncələməsi: {selectedApplicant.vacancyTitle}
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">{selectedApplicant.candidateName}</h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                  <span>{selectedApplicant.candidateEmail}</span>
                  <span>•</span>
                  <span>{selectedApplicant.candidatePhone}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Fast Track to AI Interview & Offer Modal */}
                <button
                  onClick={() => {
                    const existingAppOffer = companyOffers.find((o) => o.applicationId === selectedApplicant.id || o.candidateEmail === selectedApplicant.candidateEmail);
                    handleStartInterviewWorkflow(selectedApplicant, existingAppOffer);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                  <span>Müsahibə & Təklif Workflow</span>
                </button>

                {onShareToGoogleChat && (
                  <button
                    id="btn-business-share-applicant-chat"
                    onClick={() => onShareToGoogleChat(selectedApplicant)}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                    title="Bu namizədi Google Chat komanda otağında paylaşın"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                    <span>Google Chat</span>
                  </button>
                )}

                <button
                  id="btn-business-download-applicant-pdf"
                  onClick={async () => {
                    if (isDownloadingApplicantPDF) return;
                    setIsDownloadingApplicantPDF(true);
                    try {
                      const fileName = generateCVFileName(selectedApplicant.cvData);
                      await downloadCVAsPDF('applicant-cv-export', { fileName });
                    } catch (err) {
                      console.error('PDF export error:', err);
                      window.print();
                    } finally {
                      setIsDownloadingApplicantPDF(false);
                    }
                  }}
                  disabled={isDownloadingApplicantPDF}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer disabled:opacity-60"
                  title="Namizədin CV-sini PDF olaraq kompüterə yükləyin"
                >
                  {isDownloadingApplicantPDF ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>{isDownloadingApplicantPDF ? 'Yüklənir...' : 'CV PDF'}</span>
                </button>

                <button
                  onClick={() => setSelectedApplicant(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content: Recruiter Action Bar + CV Renderer */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Recruiter Status Updater Section */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">Namizədin Statusu:</span>
                    <select
                      value={selectedNewStatus}
                      onChange={(e) => setSelectedNewStatus(e.target.value as ApplicationStatus)}
                      className="p-2 rounded-lg bg-white border border-slate-300 font-semibold text-slate-900 outline-none"
                    >
                      <option value="Müraciət edildi">Müraciət edildi</option>
                      <option value="Baxıldı">Baxıldı</option>
                      <option value="Müsahibəyə dəvət">Müsahibəyə dəvət</option>
                      <option value="Təklif verildi">Təklif verildi</option>
                      <option value="Qəbul edildi">Qəbul edildi</option>
                      <option value="İmtina edildi">İmtina edildi</option>
                    </select>
                  </div>

                  <button
                    onClick={handleSaveApplicantStatus}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm"
                  >
                    Statusu və Qeydi Yadda Saxla
                  </button>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    İşəgötürən Qeydi / Namizədə Feedback (Namizəd də görəcək)
                  </label>
                  <textarea
                    rows={2}
                    value={recruiterNotesInput}
                    onChange={(e) => setRecruiterNotesInput(e.target.value)}
                    placeholder="Məsələn: 28 Avqust saat 15:00-da texniki müsahibəyə dəvət olunursunuz..."
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none resize-none"
                  />
                </div>
              </div>

              {/* Cover Note if provided */}
              {selectedApplicant.coverNote && (
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-800 block mb-1">Namizədin Müşayiət Məktubu:</span>
                  <p className="text-slate-700 italic leading-relaxed">"{selectedApplicant.coverNote}"</p>
                </div>
              )}

              {/* Rendered CV */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 p-4">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Namizədin Rəsmi CV Sənədi</span>
                </div>
                <CVRenderer id="applicant-cv-export" data={selectedApplicant.cvData} template="modern-emerald" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7-Step AI Interview & Job Offer Workflow Modal */}
      {activeInterviewApp && (
        <InterviewModal
          application={activeInterviewApp}
          company={activeCompany}
          existingOffer={editingOffer}
          onClose={() => {
            setActiveInterviewApp(null);
            setEditingOffer(undefined);
          }}
          onSaveOffer={(savedOffer, log) => {
            onSaveOffer(savedOffer, log);
          }}
          onUpdateAppStatus={(appId, status, notes) => {
            onUpdateApplicationStatus(appId, status, notes);
          }}
        />
      )}

      {/* Templates Management Modal */}
      {isTemplatesModalOpen && (
        <JobOfferTemplatesModal
          templates={templates}
          onUpdateTemplates={onUpdateTemplates}
          onClose={() => setIsTemplatesModalOpen(false)}
        />
      )}

      {/* Audit Log Modal */}
      {selectedAuditLogOffer && (
        <OfferAuditLogModal
          logs={auditLogs}
          offerId={selectedAuditLogOffer.id}
          candidateName={selectedAuditLogOffer.name}
          onClose={() => setSelectedAuditLogOffer(null)}
        />
      )}
    </div>
  );
};
