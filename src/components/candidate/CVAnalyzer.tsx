import React, { useState } from 'react';
import { CVData, Vacancy, CVAnalysisResult } from '../../types';
import { ATSOptimizationSidebar } from './ATSOptimizationSidebar';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Key, 
  ArrowRight, 
  TrendingUp, 
  FileText, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Zap,
  Target,
  Sliders,
  PanelRight,
  ShieldCheck
} from 'lucide-react';

interface CVAnalyzerProps {
  cvData: CVData;
  vacancies: Vacancy[];
  initialTargetVacancy?: Vacancy | null;
  onNavigateToBuilder: () => void;
}

export const CVAnalyzer: React.FC<CVAnalyzerProps> = ({
  cvData,
  vacancies,
  initialTargetVacancy,
  onNavigateToBuilder,
}) => {
  const [selectedVacancyId, setSelectedVacancyId] = useState<string>(
    initialTargetVacancy ? initialTargetVacancy.id : 'general'
  );
  const [useCustomText, setUseCustomText] = useState(false);
  const [customText, setCustomText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<CVAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const selectedVacancy = vacancies.find((v) => v.id === selectedVacancyId);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      const payload: any = {
        cvData: useCustomText
          ? {
              ...cvData,
              personalInfo: {
                ...cvData.personalInfo,
                summary: customText,
              },
            }
          : cvData,
        targetJobTitle: selectedVacancy ? selectedVacancy.title : cvData.personalInfo.jobTitle,
        vacancyDescription: selectedVacancy
          ? `${selectedVacancy.description}\nTələblər: ${selectedVacancy.requirements.join(', ')}`
          : undefined,
      };

      const response = await fetch('/api/ai/analyze-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Analiz zamanı xəta baş verdi');
      }

      const result: CVAnalysisResult = await response.json();
      setAnalysisResult(result);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Analiz zamanı xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 text-[11px] font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>AI CV Auditor & ATS Optimizatoru</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">CV Analizi və ATS Optimizasiyası</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
              Süni intellekt və real-vaxt ATS mühərriki CV-nizi hədəf vakansiyaya uyğunlaşdırır, açar söz sıxlığını, formatlama qaydalarını və robot oxunaqlığını dərhal qiymətləndirir.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-toggle-ats-sidebar"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                isSidebarOpen
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <PanelRight className="w-4 h-4 text-blue-400" />
              <span>{isSidebarOpen ? 'ATS Paneli Gizlət' : 'ATS Paneli Göstər'}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </button>
          </div>
        </div>
      </div>

      {/* Responsive Grid with ATS Sidebar */}
      <div className={`grid grid-cols-1 ${isSidebarOpen ? 'lg:grid-cols-12' : 'lg:grid-cols-1'} gap-6 items-start`}>
        {/* Main Column (8 cols when sidebar open) */}
        <div className={`space-y-6 ${isSidebarOpen ? 'lg:col-span-7 xl:col-span-7' : 'lg:col-span-12'}`}>
          {/* Control Panel: Select CV source & Target Vacancy */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="p-1 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-blue-600" />
                <span>Analiz və Hədəf Parametrləri</span>
              </h2>
              <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Avtomatik Real-Vaxt Yoxlanış</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Target Vacancy Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Hədəf Vakansiya (Açar Söz və Format Uyğunluğu Üçün)
                </label>
                <select
                  value={selectedVacancyId}
                  onChange={(e) => setSelectedVacancyId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-blue-600 transition-colors"
                >
                  <option value="general">🌐 Ümumi Əmək Bazarı Standartı ({cvData.personalInfo.jobTitle || 'Cari Peşə'})</option>
                  {vacancies.map((v) => (
                    <option key={v.id} value={v.id}>
                      📌 {v.title} ({v.companyName})
                    </option>
                  ))}
                </select>
                {selectedVacancy ? (
                  <p className="text-[11px] text-emerald-700 mt-1 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Seçildi: {selectedVacancy.title} • {selectedVacancy.skills?.length || 0} tələb olunan bacarıq</span>
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-500 mt-1">
                    Vakansiya seçdikdə yan paneldə açar söz sıxlığı dərhal yenilənir.
                  </p>
                )}
              </div>

              {/* CV Source Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Yoxlanılacaq CV Mənbəyi
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setUseCustomText(false)}
                    className={`flex-1 p-2.5 rounded-lg border text-xs font-medium transition-all ${
                      !useCustomText
                        ? 'bg-blue-50 border-blue-300 text-blue-800 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Aktiv Platforma CV-im
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseCustomText(true)}
                    className={`flex-1 p-2.5 rounded-lg border text-xs font-medium transition-all ${
                      useCustomText
                        ? 'bg-blue-50 border-blue-300 text-blue-800 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Xüsusi Mətn / Qaralama
                  </button>
                </div>
              </div>
            </div>

            {/* Custom text area if toggled */}
            {useCustomText && (
              <div className="pt-2 animate-fade-in">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  CV Mətninizi bura yapışdırın:
                </label>
                <textarea
                  rows={4}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="CV-nizin mətnini (təcrübə, bacarıqlar və s.) bura yapışdırın..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-blue-600 font-sans resize-none"
                />
              </div>
            )}

            {/* Start Analysis Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between pt-3 border-t border-slate-100 gap-3">
              <div className="text-xs text-slate-500">
                Namizəd: <span className="font-bold text-slate-800">{cvData.personalInfo.fullName}</span> ({cvData.personalInfo.jobTitle || 'Mütəxəssis'})
              </div>

              <button
                id="btn-run-analysis"
                disabled={isAnalyzing}
                onClick={runAnalysis}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>AI Analiz Edir...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Dərin AI Hesabatı Yarat</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Analysis Results Dashboard */}
          {analysisResult ? (
            <div className="space-y-6 animate-fade-in">
              {/* Main Visual Uyğunluq Panel */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900">AI Uyğunluq və Reytinq Hesabatı</h4>
                  <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">DƏRİN AI NƏTİCƏSİ</span>
                </div>

                <div className="p-6 flex flex-col md:flex-row items-center md:items-start gap-8">
                  {/* Circular Ring Gauge */}
                  <div className="w-36 h-36 rounded-full border-[10px] border-blue-50 border-t-blue-600 flex items-center justify-center relative shrink-0">
                    <div className="text-center">
                      <span className="block text-3xl font-bold text-slate-900 leading-none">{analysisResult.overallScore}%</span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-tight font-semibold">Uyğunluq</span>
                    </div>
                  </div>

                  {/* Strengths & Improvements callouts */}
                  <div className="flex-1 w-full space-y-3">
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      <p className="text-[11px] font-bold text-slate-700">Güclü tərəflər:</p>
                      <ul className="text-xs text-slate-600 mt-1 space-y-1">
                        {analysisResult.strengths?.slice(0, 3).map((str, idx) => (
                          <li key={idx}>• {str}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      <p className="text-[11px] font-bold text-slate-700">Təkmilləşdirilməli məqamlar:</p>
                      <ul className="text-xs text-slate-600 mt-1 space-y-1">
                        {(analysisResult.weaknesses || []).slice(0, 3).map((weakness, idx) => (
                          <li key={idx}>• {weakness}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actionable Feedback Detailed List */}
              {analysisResult.actionableFeedback && analysisResult.actionableFeedback.length > 0 && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Bölmələr üzrə Təkmilləşdirmə Planı</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {analysisResult.actionableFeedback.map((item, idx) => (
                      <div key={idx} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900">{item.section}</span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              item.priority === 'Yüksək'
                                ? 'bg-red-100 text-red-700'
                                : item.priority === 'Orta'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {item.priority}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">{item.issue}</p>
                        <p className="text-xs text-slate-700 font-normal pt-1 border-t border-slate-200/60">
                          💡 {item.recommendation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Secondary Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-slate-500 text-xs font-medium">ATS Robot Oxunaqlığı</p>
                  <h3 className="text-2xl font-bold mt-1 text-slate-900">{analysisResult.atsScore}%</h3>
                  <div className="mt-2 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${analysisResult.atsScore}%` }}></div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-slate-500 text-xs font-medium">Bazar Rəqabətliliyi</p>
                  <h3 className="text-sm font-bold mt-1 text-slate-900 line-clamp-1">{analysisResult.marketCompetitiveness}</h3>
                  <div className="mt-2 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-4/5"></div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-slate-500 text-xs font-medium">Açar Söz Təhlili</p>
                  <h3 className="text-2xl font-bold mt-1 text-slate-900">{analysisResult.missingKeywords?.length || 0} çatışmayan</h3>
                  <div className="mt-2 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 w-1/2"></div>
                  </div>
                </div>
              </div>

              {/* AI Executive Summary */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <span>AI Baş Rəyi & Tövsiyəsi</span>
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed font-normal">
                  {analysisResult.summaryFeedback}
                </p>
              </div>

              {/* Call to action to apply fixes in CV Builder */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">CV-nizdə Düzəlişlər Etmək İstəyirsiniz?</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    CV Generator bölməsinə keçid edərək süni intellektin və ATS panelinin təklif etdiyi düzəlişləri tətbiq edin.
                  </p>
                </div>
                <button
                  onClick={onNavigateToBuilder}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 shadow-sm transition-colors shrink-0 cursor-pointer"
                >
                  <span>CV Generatoruna Keç</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200/80 p-8 rounded-2xl text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-2xs">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Dərin AI Qiymətləndirməsi Hazırdır</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Yuxarıdakı <strong className="text-slate-700">"Dərin AI Hesabatı Yarat"</strong> düyməsinə klikləyərək CV-nizin beynəlxalq standartlar üzrə tam auditini əldə edin. Real-vaxt ATS optimizasiyası isə sağdakı paneldə aktivdir.
              </p>
            </div>
          )}
        </div>

        {/* Dedicated ATS Optimization Sidebar Column (5 cols when open) */}
        {isSidebarOpen && (
          <div className="lg:col-span-5 xl:col-span-5 lg:sticky lg:top-4">
            <ATSOptimizationSidebar
              cvData={cvData}
              targetVacancy={selectedVacancy}
              customText={useCustomText ? customText : undefined}
              onNavigateToBuilder={onNavigateToBuilder}
              onToggleOpen={() => setIsSidebarOpen(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

