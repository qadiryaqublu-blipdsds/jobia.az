import React, { useState } from 'react';
import { Vacancy, EmploymentType, ExperienceLevel, Company } from '../../types';
import { JOB_CATEGORIES, CITIES } from '../../data/mockData';
import { 
  X, 
  Sparkles, 
  Briefcase, 
  Plus, 
  Trash2, 
  RefreshCw 
} from 'lucide-react';

interface PostJobModalProps {
  company: Company;
  onClose: () => void;
  onSaveJob: (vacancy: Partial<Vacancy>) => void;
}

export const PostJobModal: React.FC<PostJobModalProps> = ({ company, onClose, onSaveJob }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(JOB_CATEGORIES[0]);
  const [employmentType, setEmploymentType] = useState<EmploymentType>('Tam ştat');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('Orta (Mid-level, 1-3 il)');
  const [city, setCity] = useState(CITIES[0]);
  const [minSalary, setMinSalary] = useState<number>(1500);
  const [maxSalary, setMaxSalary] = useState<number>(2500);
  const [hideSalary, setHideSalary] = useState(false);
  const [description, setDescription] = useState('');
  const [responsibilities, setResponsibilities] = useState<string[]>([
    'Vəzifə üzrə gündəlik əməliyyatların icrası',
    'Komanda ilə sıx koordinasiya və hesabatlılıq',
  ]);
  const [requirements, setRequirements] = useState<string[]>([
    'Müvafiq sahədə ali təhsil və 2+ il iş təcrübəsi',
    'Analitik düşüncə və komandada işləmək bacarığı',
  ]);
  const [benefits, setBenefits] = useState<string[]>([
    'Rəqabətli əmək haqqı və rüblük bonuslar',
    'Könüllü tibbi sığorta paketi',
  ]);
  const [skills, setSkills] = useState<string[]>(['Komanda İşi', 'Problem Həlli']);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiNotes, setAiNotes] = useState('');

  // AI Job Description Generator
  const handleAIGenerateJob = async () => {
    if (!title.trim()) {
      alert('Zəhmət olmasa əvvəlcə vəzifə adını daxil edin (məs: Senior React Developer).');
      return;
    }

    setIsGeneratingAI(true);
    try {
      const res = await fetch('/api/ai/generate-job-desc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          level: experienceLevel,
          employmentType,
          keyPoints: aiNotes,
        }),
      });

      const data = await res.json();
      if (data.description) setDescription(data.description);
      if (data.responsibilities) setResponsibilities(data.responsibilities);
      if (data.requirements) setRequirements(data.requirements);
      if (data.benefits) setBenefits(data.benefits);
      if (data.skills) setSkills(data.skills);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleAddResponsibility = () => setResponsibilities([...responsibilities, '']);
  const handleAddRequirement = () => setRequirements([...requirements, '']);
  const handleAddBenefit = () => setBenefits([...benefits, '']);
  const handleAddSkill = (skill: string) => {
    if (skill.trim() && !skills.includes(skill.trim())) {
      setSkills([...skills, skill.trim()]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert('Zəhmət olmasa başlıq və təsviri doldurun.');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const deadlineDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    onSaveJob({
      id: `vac-${Date.now()}`,
      title,
      companyId: company.id,
      companyName: company.name,
      companyLogo: company.logo,
      companyVerified: company.verified,
      category,
      employmentType,
      experienceLevel,
      city,
      minSalary: Number(minSalary),
      maxSalary: Number(maxSalary),
      currency: 'AZN',
      hideSalary,
      description,
      responsibilities: responsibilities.filter((r) => r.trim().length > 0),
      requirements: requirements.filter((r) => r.trim().length > 0),
      benefits: benefits.filter((b) => b.trim().length > 0),
      skills,
      postedDate: today,
      deadline: deadlineDate,
      isFeatured: false,
      isApproved: true,
      viewsCount: 1,
      applicantsCount: 0,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Yeni Vakansiya Elanı Yerləşdir</h2>
              <p className="text-xs text-slate-500 font-medium">Şirkət: {company.name}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-xs text-slate-700">
          {/* AI Helper Banner */}
          <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>AI Vakansiya Mətni Generatoru</span>
              </div>
              <button
                type="button"
                disabled={isGeneratingAI}
                onClick={handleAIGenerateJob}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
              >
                {isGeneratingAI ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>AI Yaradır...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Vakansiya Mətnini AI ilə Avtomatik Yaz</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-600">
              Vəzifə adını daxil edin və düyməyə basın. AI şirkətiniz üçün peşəkar öhdəliklər, tələblər və üstünlüklər hazırlayacaq.
            </p>
          </div>

          {/* Core Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Vəzifə Başlığı *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Məsələn: Senior Frontend Developer"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-600 outline-none font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Sahə / Kateqoriya</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-600 outline-none"
              >
                {JOB_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">İş Rejimi</label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-600 outline-none"
              >
                <option value="Tam ştat">Tam ştat</option>
                <option value="Hibrid">Hibrid</option>
                <option value="Uzaqdan (Remote)">Uzaqdan (Remote)</option>
                <option value="Yarım ştat">Yarım ştat</option>
                <option value="Təcrübə proqramı">Təcrübə proqramı</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Təcrübə Səviyyəsi</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-600 outline-none"
              >
                <option value="Təcrübəsiz / Junior">Təcrübəsiz / Junior</option>
                <option value="Orta (Mid-level, 1-3 il)">Orta (Mid-level, 1-3 il)</option>
                <option value="Baş (Senior, 3-5+ il)">Baş (Senior, 3-5+ il)</option>
                <option value="Rəhbər / Lead">Rəhbər / Lead</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Şəhər / Yerləşmə</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-600 outline-none"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Əmək Haqqı (AZN)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={minSalary}
                  onChange={(e) => setMinSalary(Number(e.target.value))}
                  placeholder="Min"
                  className="w-1/2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                />
                <span>-</span>
                <input
                  type="number"
                  value={maxSalary}
                  onChange={(e) => setMaxSalary(Number(e.target.value))}
                  placeholder="Maks"
                  className="w-1/2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">Vakansiya Haqqında Ümumi Təsvir *</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Şirkət və komanda haqqında, işin ümumi məqsədi..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-blue-600 resize-none font-sans"
            />
          </div>

          {/* Responsibilities */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800">Vəzifə Öhdəlikləri</label>
              <button
                type="button"
                onClick={handleAddResponsibility}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                + Bənd əlavə et
              </button>
            </div>
            {responsibilities.map((resp, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={resp}
                  onChange={(e) => {
                    const newArr = [...responsibilities];
                    newArr[idx] = e.target.value;
                    setResponsibilities(newArr);
                  }}
                  className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-blue-600"
                />
                <button
                  type="button"
                  onClick={() => setResponsibilities(responsibilities.filter((_, i) => i !== idx))}
                  className="text-slate-400 hover:text-red-600 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Requirements */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800">Namizədə Tələblər</label>
              <button
                type="button"
                onClick={handleAddRequirement}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                + Tələb əlavə et
              </button>
            </div>
            {requirements.map((req, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={req}
                  onChange={(e) => {
                    const newArr = [...requirements];
                    newArr[idx] = e.target.value;
                    setRequirements(newArr);
                  }}
                  className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-blue-600"
                />
                <button
                  type="button"
                  onClick={() => setRequirements(requirements.filter((_, i) => i !== idx))}
                  className="text-slate-400 hover:text-red-600 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Skills tags */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">Tələb Olunan Əsas Bacarıqlar</label>
            <div className="flex gap-2">
              <input
                id="job-skill-input"
                type="text"
                placeholder="Məs: React, TypeScript, SQL..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
                className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-blue-600"
              />
              <button
                type="button"
                onClick={() => {
                  const input = document.getElementById('job-skill-input') as HTMLInputElement;
                  if (input && input.value) {
                    handleAddSkill(input.value);
                    input.value = '';
                  }
                }}
                className="px-3 py-2 bg-slate-800 text-white rounded-lg font-medium"
              >
                Əlavə Et
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-2">
              {skills.map((s, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-md text-xs flex items-center gap-1"
                >
                  <span>{s}</span>
                  <button
                    type="button"
                    onClick={() => setSkills(skills.filter((_, i) => i !== idx))}
                    className="text-slate-400 hover:text-red-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Submit buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
            >
              Ləğv et
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-colors"
            >
              Vakansiyanı Dərc Et
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
