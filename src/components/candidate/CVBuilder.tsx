import React, { useState } from 'react';
import { 
  CVData, 
  CVTemplateType, 
  ExperienceItem, 
  EducationItem, 
  SkillItem, 
  LanguageItem, 
  ProjectItem 
} from '../../types';
import { CVRenderer } from '../cv-templates/CVRenderer';
import { SAMPLE_CANDIDATE_CV } from '../../data/mockData';
import { downloadCVAsPDF, generateCVFileName } from '../../utils/pdfExport';
import { 
  FileText, 
  Sparkles, 
  Plus, 
  Trash2, 
  Save, 
  Printer, 
  Eye, 
  User, 
  Briefcase, 
  GraduationCap, 
  Code, 
  Globe, 
  FolderGit2, 
  RefreshCw,
  CheckCircle,
  Download,
  Loader2,
  FileDown
} from 'lucide-react';

interface CVBuilderProps {
  cvData: CVData;
  onSaveCV: (data: CVData) => void;
  onAnalyzeCV: (data: CVData) => void;
}

export const CVBuilder: React.FC<CVBuilderProps> = ({ cvData, onSaveCV, onAnalyzeCV }) => {
  const [currentCV, setCurrentCV] = useState<CVData>(cvData);
  const [selectedTemplate, setSelectedTemplate] = useState<CVTemplateType>('modern-emerald');
  const [activeSection, setActiveSection] = useState<'personal' | 'experience' | 'skills' | 'education' | 'languages' | 'projects'>('personal');
  const [isGeneratingAI, setIsGeneratingAI] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [exportStatus, setExportStatus] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [mobileFitScale, setMobileFitScale] = useState(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Update personal info
  const updatePersonalInfo = (field: keyof CVData['personalInfo'], value: string) => {
    setCurrentCV((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value,
      },
    }));
  };

  // AI Content Assistant
  const handleAIGenerate = async (type: 'summary' | 'experience_bullets' | 'skills_suggestion', targetId?: string) => {
    try {
      setIsGeneratingAI(targetId || type);
      const role = currentCV.personalInfo.jobTitle || 'Mütəxəssis';
      const currentText = type === 'summary' ? currentCV.personalInfo.summary : '';

      const response = await fetch('/api/ai/generate-cv-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          role,
          currentText,
          keywords: currentCV.skills.map((s) => s.name),
        }),
      });

      const data = await response.json();

      if (data.content) {
        if (type === 'summary') {
          updatePersonalInfo('summary', data.content);
        } else if (type === 'experience_bullets' && targetId) {
          setCurrentCV((prev) => ({
            ...prev,
            experiences: prev.experiences.map((exp) =>
              exp.id === targetId ? { ...exp, description: data.content } : exp
            ),
          }));
        } else if (type === 'skills_suggestion') {
          const lines: string[] = data.content.split('\n').filter((l: string) => l.trim().length > 0);
          const newSkills: SkillItem[] = lines.map((line: string, idx: number) => ({
            id: `sk-ai-${Date.now()}-${idx}`,
            name: line.replace(/^[•\-\*\d\.]\s*/, '').trim(),
            level: 'Yaxşı',
            category: 'Texniki',
          }));
          setCurrentCV((prev) => ({
            ...prev,
            skills: [...prev.skills, ...newSkills],
          }));
        }
      }
    } catch (err) {
      console.error('AI generation error:', err);
    } finally {
      setIsGeneratingAI(null);
    }
  };

  // Experiences handlers
  const addExperience = () => {
    const newExp: ExperienceItem = {
      id: `exp-${Date.now()}`,
      company: '',
      position: '',
      location: 'Bakı, Azərbaycan',
      startDate: '2023-01',
      endDate: '2026-08',
      current: true,
      description: '• Əsas öhdəliklər və layihələrin icrası...',
    };
    setCurrentCV((prev) => ({ ...prev, experiences: [newExp, ...prev.experiences] }));
  };

  const updateExperience = (id: string, field: keyof ExperienceItem, value: any) => {
    setCurrentCV((prev) => ({
      ...prev,
      experiences: prev.experiences.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp)),
    }));
  };

  const removeExperience = (id: string) => {
    setCurrentCV((prev) => ({
      ...prev,
      experiences: prev.experiences.filter((exp) => exp.id !== id),
    }));
  };

  // Education handlers
  const addEducation = () => {
    const newEdu: EducationItem = {
      id: `edu-${Date.now()}`,
      institution: '',
      degree: 'Bakalavr',
      fieldOfStudy: '',
      startDate: '2019-09',
      endDate: '2023-06',
      current: false,
    };
    setCurrentCV((prev) => ({ ...prev, education: [...prev.education, newEdu] }));
  };

  const updateEducation = (id: string, field: keyof EducationItem, value: any) => {
    setCurrentCV((prev) => ({
      ...prev,
      education: prev.education.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu)),
    }));
  };

  const removeEducation = (id: string) => {
    setCurrentCV((prev) => ({
      ...prev,
      education: prev.education.filter((edu) => edu.id !== id),
    }));
  };

  // Skills handlers
  const addSkill = (name: string) => {
    if (!name.trim()) return;
    const newSkill: SkillItem = {
      id: `sk-${Date.now()}`,
      name: name.trim(),
      level: 'Yaxşı',
      category: 'Texniki',
    };
    setCurrentCV((prev) => ({ ...prev, skills: [...prev.skills, newSkill] }));
  };

  const removeSkill = (id: string) => {
    setCurrentCV((prev) => ({
      ...prev,
      skills: prev.skills.filter((sk) => sk.id !== id),
    }));
  };

  // Languages handlers
  const addLanguage = () => {
    const newLang: LanguageItem = {
      id: `lng-${Date.now()}`,
      language: 'İngilis dili',
      proficiency: 'B1-B2 (Orta/İşgüzar)',
    };
    setCurrentCV((prev) => ({ ...prev, languages: [...prev.languages, newLang] }));
  };

  const removeLanguage = (id: string) => {
    setCurrentCV((prev) => ({
      ...prev,
      languages: prev.languages.filter((l) => l.id !== id),
    }));
  };

  // Projects handlers
  const addProject = () => {
    const newProj: ProjectItem = {
      id: `prj-${Date.now()}`,
      title: 'Yeni Layihə',
      link: '',
      description: 'Layihənin məqsədi və texniki detalları...',
      technologies: ['React', 'TypeScript'],
    };
    setCurrentCV((prev) => ({ ...prev, projects: [...prev.projects, newProj] }));
  };

  const updateProject = (id: string, field: keyof ProjectItem, value: any) => {
    setCurrentCV((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    }));
  };

  const removeProject = (id: string) => {
    setCurrentCV((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id),
    }));
  };

  // Save changes
  const handleSave = () => {
    onSaveCV(currentCV);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Download CV as PDF
  const handleDownloadPDF = async () => {
    if (isExportingPDF) return;
    setIsExportingPDF(true);
    setExportStatus('PDF hazırlanır...');
    try {
      const fileName = generateCVFileName(currentCV);
      await downloadCVAsPDF('cv-document-export', {
        fileName,
        onProgress: (status) => setExportStatus(status),
      });
      showToast('CV uğurla PDF formatında kompüterinizə yükləndi!');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error('PDF export error:', error);
      showToast('PDF generasiyası zamanı sistem çap pəncərəsi açılır...');
      try {
        window.print();
      } catch (printErr) {
        console.error('Print fallback failed:', printErr);
      }
    } finally {
      setIsExportingPDF(false);
      setExportStatus('');
    }
  };

  // Print CV
  const handlePrint = () => {
    window.print();
  };

  // Load Sample CV
  const handleLoadSample = () => {
    setCurrentCV(SAMPLE_CANDIDATE_CV);
    showToast('Nümunə CV məlumatları yükləndi!');
  };

  return (
    <div className="space-y-6">
      {/* Top Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>Ağıllı CV Generatoru & Redaktoru</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Məlumatlarınızı daxil edin, süni intellektdən kömək alın, dizayn seçin və PDF formatında yükləyin.
          </p>
        </div>

        {/* Template Selector & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Template picker */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setSelectedTemplate('modern-emerald')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                selectedTemplate === 'modern-emerald' ? 'bg-blue-600 text-white font-semibold shadow-xs' : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              Zümrüd
            </button>
            <button
              onClick={() => setSelectedTemplate('classic-corporate')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                selectedTemplate === 'classic-corporate' ? 'bg-slate-800 text-white font-semibold shadow-xs' : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              Klassik
            </button>
            <button
              onClick={() => setSelectedTemplate('minimal-indigo')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                selectedTemplate === 'minimal-indigo' ? 'bg-indigo-600 text-white font-semibold shadow-xs' : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              Minimal
            </button>
            <button
              onClick={() => setSelectedTemplate('slate-tech')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                selectedTemplate === 'slate-tech' ? 'bg-slate-900 text-white font-semibold shadow-xs' : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              Tech
            </button>
          </div>

          <button
            onClick={handleLoadSample}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium flex items-center gap-1.5"
            title="Nümunə CV yüklə"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nümunə</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium flex items-center gap-1.5"
            title="Sənədi birbaşa printerdə çap et və ya sistem PDF pəncərəsini aç"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Çap</span>
          </button>

          <button
            onClick={() => onAnalyzeCV(currentCV)}
            className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>AI Analiz</span>
          </button>

          <button
            id="btn-download-cv-pdf"
            onClick={handleDownloadPDF}
            disabled={isExportingPDF}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-60 cursor-pointer"
            title="CV-ni A4 formatında PDF faylı kimi kompüterinizə yükləyin"
          >
            {isExportingPDF ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>{isExportingPDF ? (exportStatus || 'Yüklənir...') : 'CV-ni PDF kimi yüklə'}</span>
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium flex items-center gap-1.5 shadow-sm transition-all"
          >
            {saveSuccess ? <CheckCircle className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saveSuccess ? 'Yadda saxlandı!' : 'Yadda Saxla'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Screen Segmented Switcher */}
      <div className="lg:hidden flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold w-full">
        <button
          type="button"
          onClick={() => setMobileTab('editor')}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            mobileTab === 'editor'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>CV Redaktə Et</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('preview')}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            mobileTab === 'preview'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Canlı CV & Yüklə</span>
        </button>
      </div>

      {/* Main Builder Grid: Editor Tabs + Realtime CV Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Editor (6 cols on desktop, responsive on mobile) */}
        <div className={`lg:col-span-6 space-y-4 ${mobileTab === 'editor' ? 'block' : 'hidden lg:block'}`}>
          {/* Section Navigation Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-xs font-medium">
            <button
              onClick={() => setActiveSection('personal')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
                activeSection === 'personal'
                  ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Şəxsi & Xülasə</span>
            </button>

            <button
              onClick={() => setActiveSection('experience')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
                activeSection === 'experience'
                  ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>İş Təcrübəsi ({currentCV.experiences.length})</span>
            </button>

            <button
              onClick={() => setActiveSection('skills')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
                activeSection === 'skills'
                  ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Bacarıqlar ({currentCV.skills.length})</span>
            </button>

            <button
              onClick={() => setActiveSection('education')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
                activeSection === 'education'
                  ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Təhsil</span>
            </button>

            <button
              onClick={() => setActiveSection('languages')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
                activeSection === 'languages'
                  ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Dillər</span>
            </button>

            <button
              onClick={() => setActiveSection('projects')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
                activeSection === 'projects'
                  ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <FolderGit2 className="w-3.5 h-3.5" />
              <span>Layihələr</span>
            </button>
          </div>

          {/* Form Content Area */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            {/* 1. PERSONAL INFO SECTION */}
            {activeSection === 'personal' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Ad və Soyad</label>
                    <input
                      type="text"
                      value={currentCV.personalInfo.fullName}
                      onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                      placeholder="Məsələn: Rəşad Əliyev"
                      className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Vəzifə / Peşə Adı</label>
                    <input
                      type="text"
                      value={currentCV.personalInfo.jobTitle}
                      onChange={(e) => updatePersonalInfo('jobTitle', e.target.value)}
                      placeholder="Məsələn: Frontend Developer"
                      className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">E-poçt</label>
                    <input
                      type="email"
                      value={currentCV.personalInfo.email}
                      onChange={(e) => updatePersonalInfo('email', e.target.value)}
                      placeholder="ad.soyad@example.com"
                      className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Telefon Nömrəsi</label>
                    <input
                      type="text"
                      value={currentCV.personalInfo.phone}
                      onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                      placeholder="+994 50 123 45 67"
                      className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Ünvan / Şəhər</label>
                    <input
                      type="text"
                      value={currentCV.personalInfo.address}
                      onChange={(e) => updatePersonalInfo('address', e.target.value)}
                      placeholder="Bakı şəhəri"
                      className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">LinkedIn Profili</label>
                    <input
                      type="text"
                      value={currentCV.personalInfo.linkedin || ''}
                      onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                      placeholder="linkedin.com/in/profil"
                      className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">GitHub Profili</label>
                    <input
                      type="text"
                      value={currentCV.personalInfo.github || ''}
                      onChange={(e) => updatePersonalInfo('github', e.target.value)}
                      placeholder="github.com/istifadeci"
                      className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Portfolio / Şəxsi Vebsayt</label>
                    <input
                      type="text"
                      value={currentCV.personalInfo.portfolio || ''}
                      onChange={(e) => updatePersonalInfo('portfolio', e.target.value)}
                      placeholder="https://vebsayt.az"
                      className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-600 outline-none"
                    />
                  </div>
                </div>

                {/* Professional Summary with AI Generator */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-slate-800">
                      Peşəkar Xülasə (Summary / Haqqımda)
                    </label>
                    <button
                      type="button"
                      disabled={isGeneratingAI === 'summary'}
                      onClick={() => handleAIGenerate('summary')}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-[11px] font-semibold border border-blue-200 transition-colors disabled:opacity-50"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${isGeneratingAI === 'summary' ? 'animate-spin' : ''}`} />
                      <span>{isGeneratingAI === 'summary' ? 'AI Yazır...' : '✨ AI ilə Xülasə Yaz'}</span>
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={currentCV.personalInfo.summary}
                    onChange={(e) => updatePersonalInfo('summary', e.target.value)}
                    placeholder="Təcrübəniz, əsas ixtisasınız və karyera hədəfləriniz haqqında qısa məlumat..."
                    className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-600 outline-none resize-none leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* 2. EXPERIENCE SECTION */}
            {activeSection === 'experience' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">İş Təcrübələriniz</span>
                  <button
                    onClick={addExperience}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium flex items-center gap-1 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Təcrübə Əlavə Et</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {currentCV.experiences.map((exp, idx) => (
                    <div key={exp.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900"># {idx + 1} İş Yeri</span>
                        <button
                          onClick={() => removeExperience(exp.id)}
                          className="text-slate-400 hover:text-red-600 transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                        <div>
                          <label className="block font-medium text-slate-600 mb-1">Vəzifə</label>
                          <input
                            type="text"
                            value={exp.position}
                            onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                            placeholder="Məsələn: Senior Developer"
                            className="w-full p-2 bg-white rounded-lg border border-slate-200 outline-none focus:border-blue-600"
                          />
                        </div>

                        <div>
                          <label className="block font-medium text-slate-600 mb-1">Şirkət Adı</label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                            placeholder="Məsələn: Kapital Bank"
                            className="w-full p-2 bg-white rounded-lg border border-slate-200 outline-none focus:border-blue-600"
                          />
                        </div>

                        <div>
                          <label className="block font-medium text-slate-600 mb-1">Başlama Tarixi</label>
                          <input
                            type="month"
                            value={exp.startDate}
                            onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                            className="w-full p-2 bg-white rounded-lg border border-slate-200 outline-none focus:border-blue-600"
                          />
                        </div>

                        <div>
                          <label className="block font-medium text-slate-600 mb-1">Bitmə Tarixi</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="month"
                              disabled={exp.current}
                              value={exp.endDate}
                              onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                              className="w-full p-2 bg-white rounded-lg border border-slate-200 outline-none focus:border-blue-600 disabled:opacity-40"
                            />
                          </div>
                          <label className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-600 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={exp.current}
                              onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                              className="rounded text-blue-600 accent-blue-600"
                            />
                            <span>Hal-hazırda burada işləyirəm</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-medium text-slate-700">Öhdəliklər və Nailiyyətlər</label>
                          <button
                            type="button"
                            disabled={isGeneratingAI === exp.id}
                            onClick={() => handleAIGenerate('experience_bullets', exp.id)}
                            className="flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 hover:bg-blue-100 transition-colors"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>{isGeneratingAI === exp.id ? 'AI Yazır...' : '✨ AI ilə Nailiyyət Bəndləri Tərtib Et'}</span>
                          </button>
                        </div>
                        <textarea
                          rows={3}
                          value={exp.description}
                          onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                          placeholder="• Layihələrin idarə olunması..."
                          className="w-full p-2.5 text-xs bg-white rounded-lg border border-slate-200 outline-none focus:border-blue-600 resize-none font-sans"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. SKILLS SECTION */}
            {activeSection === 'skills' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Bacarıq və Alətlər</span>
                  <button
                    onClick={() => handleAIGenerate('skills_suggestion')}
                    disabled={isGeneratingAI === 'skills_suggestion'}
                    className="flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>✨ AI Bacarıq Təklifləri</span>
                  </button>
                </div>

                {/* Add new skill input */}
                <div className="flex gap-2">
                  <input
                    id="new-skill-input"
                    type="text"
                    placeholder="Məs: React.js, Maliyyə Təhlili, Figma, Python..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSkill((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                    className="flex-1 p-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-600 outline-none"
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById('new-skill-input') as HTMLInputElement;
                      if (input && input.value) {
                        addSkill(input.value);
                        input.value = '';
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg shadow-sm"
                  >
                    Əlavə Et
                  </button>
                </div>

                {/* Skills tags cloud */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {currentCV.skills.map((skill) => (
                    <div
                      key={skill.id}
                      className="flex items-center gap-1.5 bg-slate-100 text-slate-800 border border-slate-200 px-2.5 py-1 rounded-md text-xs font-medium"
                    >
                      <span>{skill.name}</span>
                      <button
                        onClick={() => removeSkill(skill.id)}
                        className="text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. EDUCATION SECTION */}
            {activeSection === 'education' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Təhsil Məlumatları</span>
                  <button
                    onClick={addEducation}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium flex items-center gap-1 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Təhsil Əlavə Et</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {currentCV.education.map((edu) => (
                    <div key={edu.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900">{edu.institution || 'Təhsil Müəssisəsi'}</span>
                        <button onClick={() => removeEducation(edu.id)} className="text-slate-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-600 text-[11px] mb-0.5">Müəssisə / Universitet</label>
                          <input
                            type="text"
                            value={edu.institution}
                            onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                            placeholder="Məsələn: BDU, ADNSU, ADA..."
                            className="w-full p-2 bg-white rounded-lg border border-slate-200 outline-none focus:border-blue-600"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-600 text-[11px] mb-0.5">İxtisas / Sahə</label>
                          <input
                            type="text"
                            value={edu.fieldOfStudy}
                            onChange={(e) => updateEducation(edu.id, 'fieldOfStudy', e.target.value)}
                            placeholder="Məsələn: Kompüter Elmləri"
                            className="w-full p-2 bg-white rounded-lg border border-slate-200 outline-none focus:border-blue-600"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-600 text-[11px] mb-0.5">Dərəcə</label>
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                            placeholder="Bakalavr, Magistr və s."
                            className="w-full p-2 bg-white rounded-lg border border-slate-200 outline-none focus:border-blue-600"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-600 text-[11px] mb-0.5">İllər (Başlama - Bitmə)</label>
                          <div className="flex gap-1">
                            <input
                              type="text"
                              value={edu.startDate}
                              onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                              placeholder="2018"
                              className="w-1/2 p-2 bg-white rounded-lg border border-slate-200 outline-none focus:border-blue-600"
                            />
                            <input
                              type="text"
                              value={edu.endDate}
                              onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                              placeholder="2022"
                              className="w-1/2 p-2 bg-white rounded-lg border border-slate-200 outline-none focus:border-blue-600"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. LANGUAGES SECTION */}
            {activeSection === 'languages' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Xarici Dil Bilikləri</span>
                  <button
                    onClick={addLanguage}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium flex items-center gap-1 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Dil Əlavə Et</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {currentCV.languages.map((lng) => (
                    <div key={lng.id} className="flex items-center gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <input
                        type="text"
                        value={lng.language}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCurrentCV((p) => ({
                            ...p,
                            languages: p.languages.map((l) => (l.id === lng.id ? { ...l, language: val } : l)),
                          }));
                        }}
                        placeholder="Dil adı (məs: İngilis)"
                        className="flex-1 p-1.5 bg-white rounded-lg border border-slate-200 outline-none focus:border-blue-600"
                      />
                      <select
                        value={lng.proficiency}
                        onChange={(e) => {
                          const val = e.target.value as any;
                          setCurrentCV((p) => ({
                            ...p,
                            languages: p.languages.map((l) => (l.id === lng.id ? { ...l, proficiency: val } : l)),
                          }));
                        }}
                        className="p-1.5 bg-white rounded-lg border border-slate-200 outline-none focus:border-blue-600"
                      >
                        <option value="Ana dili">Ana dili</option>
                        <option value="C1-C2 (Sərbəst)">C1-C2 (Sərbəst)</option>
                        <option value="B1-B2 (Orta/İşgüzar)">B1-B2 (Orta/İşgüzar)</option>
                        <option value="A1-A2 (Başlanğıc)">A1-A2 (Başlanğıc)</option>
                      </select>
                      <button onClick={() => removeLanguage(lng.id)} className="text-slate-400 hover:text-red-600 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. PROJECTS SECTION */}
            {activeSection === 'projects' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Layihələr & Portfel</span>
                  <button
                    onClick={addProject}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium flex items-center gap-1 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Layihə Əlavə Et</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {currentCV.projects.map((proj) => (
                    <div key={proj.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900">{proj.title}</span>
                        <button onClick={() => removeProject(proj.id)} className="text-slate-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={proj.title}
                          onChange={(e) => updateProject(proj.id, 'title', e.target.value)}
                          placeholder="Layihə adı"
                          className="p-2 bg-white rounded-lg border border-slate-200 outline-none focus:border-blue-600"
                        />
                        <input
                          type="text"
                          value={proj.link || ''}
                          onChange={(e) => updateProject(proj.id, 'link', e.target.value)}
                          placeholder="Layihə linki (GitHub və ya Canlı link)"
                          className="p-2 bg-white rounded-lg border border-slate-200 outline-none focus:border-blue-600"
                        />
                      </div>

                      <textarea
                        rows={2}
                        value={proj.description}
                        onChange={(e) => updateProject(proj.id, 'description', e.target.value)}
                        placeholder="Layihənin qısa təsviri..."
                        className="w-full p-2 bg-white rounded-lg border border-slate-200 outline-none focus:border-blue-600 resize-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Responsive CV Preview (6 cols on desktop, full width when active on mobile) */}
        <div className={`lg:col-span-6 sticky top-20 ${mobileTab === 'preview' ? 'block' : 'hidden lg:block'}`}>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2 bg-white p-2.5 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-blue-600" />
              <span>Canlı CV ({selectedTemplate})</span>
            </span>

            <div className="flex flex-wrap items-center gap-2">
              {/* Mobile scale toggle */}
              <button
                type="button"
                onClick={() => setMobileFitScale(!mobileFitScale)}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[11px] font-semibold transition-colors lg:hidden cursor-pointer"
                title="Mobil ekrana uyğunlaşdırma rejimi"
              >
                {mobileFitScale ? '🔍 100% Ölçü' : '📱 Ekrana Sığdır'}
              </button>

              <button
                id="btn-preview-download-pdf"
                onClick={handleDownloadPDF}
                disabled={isExportingPDF}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                title="CV-ni PDF formatında yüklə"
              >
                {isExportingPDF ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>{isExportingPDF ? (exportStatus || 'Yüklənir...') : 'PDF Yüklə'}</span>
              </button>

              <span className="text-[11px] text-slate-400 hidden sm:inline">A4 Format</span>
            </div>
          </div>

          <div className={`rounded-xl shadow-md border border-slate-200 bg-slate-100 p-2 sm:p-4 max-h-[820px] overflow-y-auto ${mobileFitScale ? 'overflow-x-hidden' : 'overflow-x-auto'}`}>
            <div className={mobileFitScale ? 'w-full origin-top transform-gpu scale-[0.48] xs:scale-[0.58] sm:scale-[0.78] md:scale-[0.9] lg:scale-100 my-0 -mb-[260px] xs:-mb-[200px] sm:-mb-[100px] lg:mb-0 transition-transform' : 'min-w-[700px]'}>
              <CVRenderer id="cv-document-export" data={currentCV} template={selectedTemplate} />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 animate-bounce-in border border-slate-700">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
