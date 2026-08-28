import React, { useState, useMemo, useEffect } from 'react';
import { Vacancy, CVData } from '../../types';
import { JOB_CATEGORIES, CITIES, SAMPLE_COMPANIES } from '../../data/mockData';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Search, 
  MapPin, 
  DollarSign, 
  Sparkles, 
  Bookmark, 
  Calendar, 
  ChevronRight, 
  Award,
  CheckCircle2,
  TrendingUp,
  StickyNote,
  Send,
  Save,
  Edit3,
  X,
  Zap,
  Filter,
  Briefcase,
  Layers,
  ArrowUpDown,
  Building2,
  RotateCcw,
  Bot,
  Phone,
  MessageCircle,
  Clock,
  ShieldCheck,
  Check,
  PhoneCall,
  SlidersHorizontal,
  Info,
  Eye,
  Heart,
  Laptop,
  Code,
  GraduationCap,
  Palette,
  ShoppingBag,
  Cog,
  Users,
  Landmark,
  Megaphone,
  UserCheck,
  CheckCircle,
  FileCheck,
  Flame,
  ArrowUpRight,
  Factory,
  Stethoscope,
  BookOpen,
  Utensils,
  Scale,
  Truck,
  ChevronDown
} from 'lucide-react';

interface JobExplorerProps {
  vacancies: Vacancy[];
  onSelectVacancy: (vacancy: Vacancy) => void;
  savedJobIds: string[];
  onToggleBookmark: (jobId: string) => void;
  jobNotes?: Record<string, string>;
  onSaveJobNote?: (jobId: string, note: string) => void;
  onQuickApply?: (vacancy: Vacancy) => void;
  onOpenCVAnalyzer: () => void;
  onOpenCVBuilder: () => void;
  onOpenSalaryTrends?: () => void;
  userCV: CVData;
}

interface AIMatchResult {
  id: string;
  matchScore: number;
  matchReason: string;
  keyHighlights: string[];
}

export const COMPANY_INDUSTRIES = [
  'Bank və Maliyyə Texnologiyaları',
  'İnvestisiya və Holdinqlər',
  'İT və Telekommunikasiya',
  'Pərakəndə Ticarət və FMCG',
  'Mühəndislik və Tikinti',
  'Səhiyyə və Tibb',
  'Təhsil və Təlim',
  'Otelçilik və Restoran (HoReCa)',
  'Hüquq və Konsaltinq',
  'Logistika və Nəqliyyat',
  'İstehsalat və Sənaye',
];

export const FEATURED_COMPANIES = [
  { name: 'IRES MMC', logo: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=120&q=80', isPartner: true },
  { name: 'PashaPay', logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80', isHot: true },
  { name: 'Kapital Bank', logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=120&q=80' },
  { name: 'SOCAR Green', logo: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=120&q=80' },
  { name: 'Azercell', logo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=120&q=80' },
  { name: 'Bravo Supermarket', logo: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=120&q=80' },
  { name: 'ABB Bank', logo: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=120&q=80' },
  { name: 'Port Baku Towers', logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=120&q=80' },
  { name: 'Titan Electronics', logo: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=120&q=80' },
  { name: 'Kollekta MMC', logo: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=120&q=80' },
  { name: 'International BOKT', logo: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=120&q=80' },
];

export const LANDING_CATEGORIES = [
  { id: 'it', name: 'IT və Proqramlaşdırma', categoryKey: 'İT və Proqramlaşdırma', count: '340+', icon: Laptop, color: 'text-blue-600 bg-blue-50 border-blue-100 hover:border-blue-300' },
  { id: 'marketing', name: 'Marketinq və PR', categoryKey: 'Marketinq, Reklam və PR', count: '185+', icon: Megaphone, color: 'text-rose-600 bg-rose-50 border-rose-100 hover:border-rose-300' },
  { id: 'finance', name: 'Maliyyə və Mühasibat', categoryKey: 'Maliyyə və Mühasibat', count: '290+', icon: Landmark, color: 'text-emerald-600 bg-emerald-50 border-emerald-100 hover:border-emerald-300' },
  { id: 'education', name: 'Təhsil və Təlim', categoryKey: 'Təhsil, Elm və Təlim', count: '120+', icon: GraduationCap, color: 'text-amber-600 bg-amber-50 border-amber-100 hover:border-amber-300' },
  { id: 'design', name: 'Dizayn və Kreativ', categoryKey: 'Dizayn və Yaradıcılıq', count: '95+', icon: Palette, color: 'text-purple-600 bg-purple-50 border-purple-100 hover:border-purple-300' },
  { id: 'sales', name: 'Satış və Müştəri Xidmətləri', categoryKey: 'Satış və Müştəri Xidmətləri', count: '410+', icon: ShoppingBag, color: 'text-cyan-600 bg-cyan-50 border-cyan-100 hover:border-cyan-300' },
  { id: 'engineering', name: 'Mühəndislik və İstehsalat', categoryKey: 'Mühəndislik və Tikinti', count: '215+', icon: Cog, color: 'text-orange-600 bg-orange-50 border-orange-100 hover:border-orange-300' },
  { id: 'hr', name: 'İnzibati və İnsan Resursları', categoryKey: 'İnsan Resursları (HR)', count: '160+', icon: Users, color: 'text-indigo-600 bg-indigo-50 border-indigo-100 hover:border-indigo-300' },
];

export const JobExplorer: React.FC<JobExplorerProps> = ({
  vacancies,
  onSelectVacancy,
  savedJobIds,
  onToggleBookmark,
  jobNotes = {},
  onSaveJobNote,
  onQuickApply,
  onOpenCVAnalyzer,
  onOpenCVBuilder,
  onOpenSalaryTrends,
  userCV,
}) => {
  const { dict, language, brandAcronym, brandSlogan } = useLanguage();

  // Mode: 'simple' (accessible for blue-collar / everyone) vs 'detailed' (advanced with full AI/ATS)
  const [viewMode, setViewMode] = useState<'simple' | 'detailed'>(() => {
    try {
      const saved = localStorage.getItem('jobia_explorer_view_mode');
      if (saved === 'simple' || saved === 'detailed') return saved;
    } catch {
      // fallback
    }
    return 'simple'; // Default to friendly simple mode for everyone
  });

  const handleSetViewMode = (mode: 'simple' | 'detailed') => {
    setViewMode(mode);
    try {
      localStorage.setItem('jobia_explorer_view_mode', mode);
    } catch {
      // ignore
    }
  };

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Hamısı');
  const [selectedCompany, setSelectedCompany] = useState<string>('Hamısı');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('Hamısı');
  const [companySearchQuery, setCompanySearchQuery] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('Hamısı');
  const [selectedType, setSelectedType] = useState<string>('Hamısı');
  const [selectedExperience, setSelectedExperience] = useState<string>('Hamısı');
  const [minSalaryFilter, setMinSalaryFilter] = useState<number>(0);
  const [onlyFeatured, setOnlyFeatured] = useState(false);
  const [onlySaved, setOnlySaved] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'salary-desc' | 'views-desc' | 'title-asc' | 'company-asc' | 'ai-match'>('newest');

  // Blue collar quick profession selection state (for simple view)
  const [quickProfessionFilter, setQuickProfessionFilter] = useState<string>('all');

  // Simple Mode Direct Quick Apply Modal State
  const [quickApplyJob, setQuickApplyJob] = useState<Vacancy | null>(null);
  const [quickApplicantName, setQuickApplicantName] = useState(userCV.personalInfo.fullName || '');
  const [quickApplicantPhone, setQuickApplicantPhone] = useState(userCV.personalInfo.phone || '');
  const [quickApplySuccess, setQuickApplySuccess] = useState(false);

  // AI Smart Search States
  const [isAiModeActive, setIsAiModeActive] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiMatchesMap, setAiMatchesMap] = useState<Record<string, AIMatchResult>>({});
  const [aiSearchSummary, setAiSearchSummary] = useState<string | null>(null);

  // Mobile dedicated filter modal state ('none' | 'categories' | 'industries' | 'companies' | 'filters' | 'ai')
  const [mobileFilterModal, setMobileFilterModal] = useState<'none' | 'categories' | 'industries' | 'companies' | 'filters' | 'ai'>('none');

  // Private note editing
  const [editingNoteJobId, setEditingNoteJobId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');

  // Keep quick applicant info synced with user CV when available
  useEffect(() => {
    if (userCV?.personalInfo?.fullName && !quickApplicantName) {
      setQuickApplicantName(userCV.personalInfo.fullName);
    }
    if (userCV?.personalInfo?.phone && !quickApplicantPhone) {
      setQuickApplicantPhone(userCV.personalInfo.phone);
    }
  }, [userCV, quickApplicantName, quickApplicantPhone]);

  // Helper to format date in clean friendly local text (Bu gün, Dünən, etc.)
  const formatJobDate = (dateStr: string) => {
    try {
      const today = new Date('2026-08-28');
      const postDate = new Date(dateStr);
      const diffTime = today.getTime() - postDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) {
        return language === 'en' ? 'Today' : language === 'ru' ? 'Сегодня' : 'Bu gün';
      }
      if (diffDays === 1) {
        return language === 'en' ? 'Yesterday' : language === 'ru' ? 'Вчера' : 'Dünən';
      }
      if (diffDays < 7) {
        return language === 'en' ? `${diffDays}d ago` : language === 'ru' ? `${diffDays} дн. назад` : `${diffDays} gün əvvəl`;
      }
      
      const monthsAz = ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avq', 'sen', 'okt', 'noy', 'dek'];
      const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthsRu = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
      
      const day = postDate.getDate();
      const monthIdx = postDate.getMonth();
      const monthStr = language === 'en' ? monthsEn[monthIdx] : language === 'ru' ? monthsRu[monthIdx] : monthsAz[monthIdx];
      return `${day} ${monthStr}`;
    } catch {
      return dateStr;
    }
  };

  // Helper for view count (e.g., 1400 -> 1.4K)
  const formatViewsCount = (count?: number) => {
    if (!count) return '45';
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1).replace('.0', '')}K`;
    }
    return count.toString();
  };

  // Posted Date filter in simple view (1 gün, 3 gün, 1 həftə, 2 həftə, Hamısı)
  const [postedDateFilter, setPostedDateFilter] = useState<string>('all');

  // Pre-calculate count of vacancies per category (Job Categories)
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      Hamısı: vacancies.filter((v) => v.isApproved !== false).length,
    };
    JOB_CATEGORIES.forEach((cat) => {
      counts[cat] = vacancies.filter((v) => v.isApproved !== false && v.category === cat).length;
    });
    return counts;
  }, [vacancies]);

  // Companies List with Stats & Logotypes
  const companyListWithStats = useMemo(() => {
    const map: Record<string, { count: number; logo: string; verified: boolean; industry?: string }> = {};
    
    // Seed with known companies
    SAMPLE_COMPANIES.forEach((c) => {
      map[c.name] = {
        count: 0,
        logo: c.logo,
        verified: c.verified,
        industry: c.industry,
      };
    });

    // Count from actual vacancies
    vacancies.forEach((v) => {
      if (v.isApproved === false) return;
      if (!map[v.companyName]) {
        map[v.companyName] = {
          count: 0,
          logo: v.companyLogo || 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=150&auto=format&fit=crop&q=80',
          verified: v.companyVerified ?? true,
          industry: v.category,
        };
      }
      map[v.companyName].count += 1;
    });

    return Object.entries(map).map(([name, data]) => ({
      name,
      ...data,
    })).sort((a, b) => b.count - a.count);
  }, [vacancies]);

  // Filtered Company List for Sidebar search
  const filteredCompaniesForSidebar = useMemo(() => {
    if (!companySearchQuery.trim()) return companyListWithStats;
    const q = companySearchQuery.toLowerCase();
    return companyListWithStats.filter((c) => c.name.toLowerCase().includes(q));
  }, [companyListWithStats, companySearchQuery]);

  // Pre-calculate count of vacancies per Industry
  const industryStats = useMemo(() => {
    const counts: Record<string, number> = {
      'Hamısı': vacancies.filter((v) => v.isApproved !== false).length,
    };

    COMPANY_INDUSTRIES.forEach((ind) => {
      const indLower = ind.toLowerCase();
      const count = vacancies.filter((v) => {
        if (v.isApproved === false) return false;
        const comp = SAMPLE_COMPANIES.find((c) => c.name.toLowerCase() === v.companyName.toLowerCase());
        const compInd = comp?.industry?.toLowerCase() || '';
        return (
          compInd.includes(indLower) ||
          indLower.includes(compInd) ||
          v.category.toLowerCase().includes(indLower) ||
          indLower.includes(v.category.toLowerCase())
        );
      }).length;
      counts[ind] = count;
    });

    return counts;
  }, [vacancies]);

  // Quick Profession Buttons (Especially for Blue Collar & Service Roles)
  const quickProfessions = useMemo(() => {
    if (language === 'en') {
      return [
        { id: 'all', label: 'All Jobs', icon: '🌐', keywords: [] },
        { id: 'driver', label: 'Driver', icon: '🚗', keywords: ['sürücü', 'driver', 'şəxsi sürücü', 'avto'] },
        { id: 'seller', label: 'Cashier / Sales', icon: '🛒', keywords: ['kassir', 'satıcı', 'satış', 'kassa', 'sales', 'məsləhətçi'] },
        { id: 'courier', label: 'Courier / Delivery', icon: '🛵', keywords: ['kuryer', 'courier', 'çatdırılma', 'moto'] },
        { id: 'security', label: 'Security Guard', icon: '🛡️', keywords: ['mühafizə', 'mühafizəçi', 'təhlükəsizlik', 'security', 'keşikçi'] },
        { id: 'cook', label: 'Cook / Kitchen', icon: '🍳', keywords: ['aşpaz', 'mətbəx', 'qabyuyan', 'cook', 'chef'] },
        { id: 'worker', label: 'Technician / Handyman', icon: '🔨', keywords: ['fəhlə', 'usta', 'elektrik', 'santexnik', 'təmir', 'texnik'] },
        { id: 'cleaner', label: 'Cleaning Staff', icon: '🧹', keywords: ['xadimə', 'təmizlik', 'cleaner'] },
        { id: 'warehouse', label: 'Warehouse / Packer', icon: '📦', keywords: ['anbar', 'anbardar', 'paketləyici', 'fəhlə', 'warehouse'] },
        { id: 'operator', label: 'Call Center', icon: '📞', keywords: ['operator', 'zəng', 'call center', 'müştəri xidmətləri'] },
        { id: 'office', label: 'Office & Admin', icon: '🏢', keywords: ['ofis', 'inzibati', 'menecer', 'köməkçi', 'admin'] },
      ];
    }
    if (language === 'ru') {
      return [
        { id: 'all', label: 'Все вакансии', icon: '🌐', keywords: [] },
        { id: 'driver', label: 'Водитель', icon: '🚗', keywords: ['sürücü', 'водитель', 'driver', 'şəxsi sürücü', 'avto'] },
        { id: 'seller', label: 'Продавец / Кассир', icon: '🛒', keywords: ['kassir', 'satıcı', 'кассир', 'продавец', 'satış', 'kassa'] },
        { id: 'courier', label: 'Курьер / Доставка', icon: '🛵', keywords: ['kuryer', 'курьер', 'доставка', 'çatdırılma', 'moto'] },
        { id: 'security', label: 'Охранник', icon: '🛡️', keywords: ['mühafizə', 'mühafizəçi', 'охранник', 'təhlükəsizlik', 'security'] },
        { id: 'cook', label: 'Повар / Кухня', icon: '🍳', keywords: ['aşpaz', 'повар', 'mətbəx', 'qabyuyan', 'посудомойщица'] },
        { id: 'worker', label: 'Мастер / Электрик', icon: '🔨', keywords: ['fəhlə', 'usta', 'мастер', 'электрик', 'santexnik', 'texnik'] },
        { id: 'cleaner', label: 'Уборщица / Клининг', icon: '🧹', keywords: ['xadimə', 'уборщица', 'клининг', 'təmizlik'] },
        { id: 'warehouse', label: 'Кладовщик / Склад', icon: '📦', keywords: ['anbar', 'anbardar', 'кладовщик', 'склад', 'paketləyici'] },
        { id: 'operator', label: 'Оператор колл-центра', icon: '📞', keywords: ['operator', 'оператор', 'zəng', 'call center'] },
        { id: 'office', label: 'Офис / Администрация', icon: '🏢', keywords: ['ofis', 'офис', 'администратор', 'menecer'] },
      ];
    }
    return [
      { id: 'all', label: 'Bütün Vakansiyalar', icon: '🌐', keywords: [] },
      { id: 'driver', label: 'Sürücü', icon: '🚗', keywords: ['sürücü', 'driver', 'şəxsi sürücü', 'avto', 'sürücülük'] },
      { id: 'seller', label: 'Satıcı / Kassir', icon: '🛒', keywords: ['kassir', 'satıcı', 'satış', 'kassa', 'məsləhətçi'] },
      { id: 'courier', label: 'Kuryer / Çatdırılma', icon: '🛵', keywords: ['kuryer', 'çatdırılma', 'moto', 'kuryerlik'] },
      { id: 'security', label: 'Mühafizəçi', icon: '🛡️', keywords: ['mühafizə', 'mühafizəçi', 'təhlükəsizlik', 'keşikçi'] },
      { id: 'cook', label: 'Aşpaz / Mətbəx', icon: '🍳', keywords: ['aşpaz', 'mətbəx', 'qabyuyan', 'restoran'] },
      { id: 'worker', label: 'Fəhlə / Usta', icon: '🔨', keywords: ['fəhlə', 'usta', 'elektrik', 'santexnik', 'təmir', 'texnik'] },
      { id: 'cleaner', label: 'Xadimə / Təmizlik', icon: '🧹', keywords: ['xadimə', 'təmizlik', 'təmizkar'] },
      { id: 'warehouse', label: 'Anbardar / Paketləyici', icon: '📦', keywords: ['anbar', 'anbardar', 'paketləyici', 'sayım'] },
      { id: 'operator', label: 'Zəng Mərkəzi / Operator', icon: '📞', keywords: ['operator', 'zəng', 'call center', 'müştəri xidmətləri'] },
      { id: 'office', label: 'Ofis və İnzibati İşlər', icon: '🏢', keywords: ['ofis', 'inzibati', 'menecer', 'köməkçi', 'katibə'] },
    ];
  }, [language]);

  // AI Smart Search function
  const handleRunAiSearch = async (customPrompt?: string, useCVProfile: boolean = false) => {
    const queryToUse = customPrompt !== undefined ? customPrompt : aiPrompt;
    setIsAiSearching(true);
    setIsAiModeActive(true);

    try {
      const response = await fetch('/api/ai/smart-search-vacancies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryToUse,
          candidateCV: useCVProfile ? userCV : undefined,
          vacancies: vacancies.filter((v) => v.isApproved !== false),
        }),
      });

      if (!response.ok) {
        throw new Error('AI axtarış xətası');
      }

      const data = await response.json();
      if (data && Array.isArray(data.matchedVacancies)) {
        const mapping: Record<string, AIMatchResult> = {};
        data.matchedVacancies.forEach((m: AIMatchResult) => {
          mapping[m.id] = m;
        });
        setAiMatchesMap(mapping);
        setSortBy('ai-match');

        if (useCVProfile) {
          setAiSearchSummary(
            language === 'en'
              ? `Matched optimal vacancies based on your CV skills (${userCV.personalInfo.jobTitle || 'Profile'}).`
              : language === 'ru'
              ? `Подобраны вакансии, соответствующие навыкам из резюме (${userCV.personalInfo.jobTitle || 'Специальность'}).`
              : `CV-nizdəki (${userCV.personalInfo.jobTitle || 'İxtisas'}) bacarıqlarınıza uyğun ən optimal vakansiyalar tapıldı.`
          );
        } else if (queryToUse.trim()) {
          setAiSearchSummary(
            language === 'en'
              ? `AI ranked best vacancies according to "${queryToUse}".`
              : language === 'ru'
              ? `ИИ подобрал наиболее подходящие вакансии по запросу "${queryToUse}".`
              : `"${queryToUse}" sorğusuna əsasən AI tərəfindən ən uyğun vakansiyalar reytinqləndi.`
          );
        }
      }
    } catch (err) {
      console.warn('AI Smart Search fallback:', err);
    } finally {
      setIsAiSearching(false);
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('Hamısı');
    setSelectedCompany('Hamısı');
    setSelectedIndustry('Hamısı');
    setCompanySearchQuery('');
    setSelectedCity('Hamısı');
    setSelectedType('Hamısı');
    setSelectedExperience('Hamısı');
    setMinSalaryFilter(0);
    setOnlyFeatured(false);
    setOnlySaved(false);
    setSortBy('newest');
    setQuickProfessionFilter('all');
    setPostedDateFilter('all');
    setIsAiModeActive(false);
    setAiPrompt('');
    setAiMatchesMap({});
    setAiSearchSummary(null);
  };

  // Quick Preset Prompts
  const quickAiPrompts = useMemo(() => {
    if (language === 'en') {
      return [
        { label: '🎯 Match My CV', isCV: true },
        { label: '🚀 High Salary (2500+ AZN)', prompt: '2500 AZN and higher salary vacancies' },
        { label: '💻 Frontend & Dev', prompt: 'React, TypeScript, JavaScript and Developer roles' },
        { label: '🏠 Full Remote', prompt: 'Remote work vacancies' },
        { label: '🎓 Students & Internships', prompt: 'Internship and junior entry level programs' },
        { label: '📊 Finance & Accounting', prompt: 'Financial analyst, 1C and accounting roles' },
        { label: '🏥 Medical & Pharmacy', prompt: 'Doctors, pharmacists and healthcare roles' },
        { label: '🚚 Logistics & Supply', prompt: 'Logistics, transport and supply chain vacancies' },
      ];
    }
    if (language === 'ru') {
      return [
        { label: '🎯 По моему резюме', isCV: true },
        { label: '🚀 Высокая зарплата (2500+ AZN)', prompt: 'Вакансии с зарплатой от 2500 AZN и выше' },
        { label: '💻 Frontend и Разработка', prompt: 'React, TypeScript, JavaScript и веб-разработка' },
        { label: '🏠 Удаленная работа (Remote)', prompt: 'Удаленный формат работы Remote' },
        { label: '🎓 Для студентов и стажеров', prompt: 'Программы стажировок и вакансии для начинающих' },
        { label: '📊 Финансы и Бухгалтерия', prompt: 'Финансовые аналитики, 1C и бухучет' },
        { label: '🏥 Медицина и Фармацевтика', prompt: 'Врачи, фармацевты и здравоохранение' },
        { label: '🚚 Логистика и Снабжение', prompt: 'Логистика, таможня и закупки' },
      ];
    }
    return [
      { label: '🎯 Mənim CV-mə Görə', isCV: true },
      { label: '🚀 Yüksək Maaşlı (2500+ AZN)', prompt: '2500 AZN və daha yüksək maaşlı vakansiyalar' },
      { label: '💻 Frontend & Proqramlaşdırma', prompt: 'React, TypeScript, JavaScript və Proqramlaşdırma' },
      { label: '🏠 Tam Uzaqdan (Remote)', prompt: 'Uzaqdan Remote iş rejimi olan vakansiyalar' },
      { label: '🎓 Tələbə & Təcrübə Proqramları', prompt: 'Tələbələr və yeni başlayanlar üçün təcrübə proqramları' },
      { label: '📊 Maliyyə & 1C Mühasibat', prompt: 'Maliyyə analitiki, 1C və mühasibatlıq elanları' },
      { label: '🏥 Tibb & Əczaçılıq', prompt: 'Həkim, əczaçı və səhiyyə vakansiyaları' },
      { label: '🚚 Logistika & Təchizat', prompt: 'Logistika, nəqliyyat və gömrük vakansiyaları' },
    ];
  }, [language]);

  // Filtering & Sorting
  const filteredAndSortedVacancies = useMemo(() => {
    let result = vacancies.filter((job) => {
      // Must be approved by admin
      if (job.isApproved === false) return false;

      // Quick Profession Filter (used in simple mode)
      if (quickProfessionFilter !== 'all') {
        const prof = quickProfessions.find((p) => p.id === quickProfessionFilter);
        if (prof && prof.keywords.length > 0) {
          const matchKeywords = prof.keywords.some((kw) => {
            const lowKw = kw.toLowerCase();
            return (
              job.title.toLowerCase().includes(lowKw) ||
              job.category.toLowerCase().includes(lowKw) ||
              job.skills.some((s) => s.toLowerCase().includes(lowKw)) ||
              job.description.toLowerCase().includes(lowKw)
            );
          });
          if (!matchKeywords) return false;
        }
      }

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = job.title.toLowerCase().includes(q);
        const matchesCompany = job.companyName.toLowerCase().includes(q);
        const matchesSkills = job.skills.some((s) => s.toLowerCase().includes(q));
        const matchesDesc = job.description.toLowerCase().includes(q);
        const matchesCat = job.category.toLowerCase().includes(q);
        const matchesCity = job.city.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCompany && !matchesSkills && !matchesDesc && !matchesCat && !matchesCity) {
          return false;
        }
      }

      // Category filter (in detailed view or sidebar)
      if (selectedCategory !== 'Hamısı' && job.category !== selectedCategory) {
        return false;
      }

      // Company filter (by name)
      if (selectedCompany !== 'Hamısı' && job.companyName.toLowerCase() !== selectedCompany.toLowerCase()) {
        return false;
      }

      // Company Industry filter
      if (selectedIndustry !== 'Hamısı') {
        const indLower = selectedIndustry.toLowerCase();
        const comp = SAMPLE_COMPANIES.find((c) => c.name.toLowerCase() === job.companyName.toLowerCase());
        const compInd = comp?.industry?.toLowerCase() || '';
        const matchesInd = compInd.includes(indLower) || 
                           indLower.includes(compInd) || 
                           job.category.toLowerCase().includes(indLower) ||
                           indLower.includes(job.category.toLowerCase());
        if (!matchesInd) {
          return false;
        }
      }

      // City filter
      if (selectedCity !== 'Hamısı' && job.city !== selectedCity) {
        return false;
      }

      // Employment type filter
      if (selectedType !== 'Hamısı' && job.employmentType !== selectedType) {
        return false;
      }

      // Experience level filter
      if (selectedExperience !== 'Hamısı' && job.experienceLevel !== selectedExperience) {
        return false;
      }

      // Featured only
      if (onlyFeatured && !job.isFeatured) {
        return false;
      }

      // Saved only
      if (onlySaved && !savedJobIds.includes(job.id)) {
        return false;
      }

      // Min salary filter
      if (minSalaryFilter > 0 && job.maxSalary && job.maxSalary < minSalaryFilter) {
        return false;
      }

      // Posted Date filter
      if (postedDateFilter !== 'all') {
        const today = new Date('2026-08-28').getTime();
        const postTime = new Date(job.postedDate).getTime();
        const diffDays = (today - postTime) / (1000 * 60 * 60 * 24);

        if (postedDateFilter === '1_day' && diffDays > 1) return false;
        if (postedDateFilter === '3_days' && diffDays > 3) return false;
        if (postedDateFilter === '1_week' && diffDays > 7) return false;
        if (postedDateFilter === '10_days' && diffDays > 10) return false;
        if (postedDateFilter === '2_weeks' && diffDays > 14) return false;
      }

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'ai-match') {
        const scoreA = aiMatchesMap[a.id]?.matchScore || 0;
        const scoreB = aiMatchesMap[b.id]?.matchScore || 0;
        if (scoreB !== scoreA) return scoreB - scoreA;
      }

      if (sortBy === 'salary-desc') {
        const maxA = a.maxSalary || 0;
        const maxB = b.maxSalary || 0;
        return maxB - maxA;
      }

      if (sortBy === 'views-desc') {
        return (b.viewsCount || 0) - (a.viewsCount || 0);
      }

      if (sortBy === 'title-asc') {
        return a.title.localeCompare(b.title);
      }

      if (sortBy === 'company-asc') {
        return a.companyName.localeCompare(b.companyName);
      }

      // Default: Featured first, then newest date
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
    });

    return result;
  }, [
    vacancies,
    searchQuery,
    quickProfessionFilter,
    quickProfessions,
    selectedCategory,
    selectedCompany,
    selectedIndustry,
    selectedCity,
    selectedType,
    selectedExperience,
    minSalaryFilter,
    postedDateFilter,
    onlyFeatured,
    onlySaved,
    sortBy,
    savedJobIds,
    aiMatchesMap,
  ]);

  const activeFiltersCount = [
    searchQuery.trim() !== '',
    quickProfessionFilter !== 'all',
    postedDateFilter !== 'all',
    selectedCategory !== 'Hamısı',
    selectedCompany !== 'Hamısı',
    selectedIndustry !== 'Hamısı',
    selectedCity !== 'Hamısı',
    selectedType !== 'Hamısı',
    selectedExperience !== 'Hamısı',
    minSalaryFilter > 0,
    onlyFeatured,
    onlySaved,
    isAiModeActive,
  ].filter(Boolean).length;

  // Handle Quick Direct WhatsApp Message
  const handleOpenWhatsApp = (job: Vacancy) => {
    const phone = job.contactWhatsapp || '994502001122';
    const text = encodeURIComponent(
      `Salam! jobia.az portalında yerləşdirdiyiniz "${job.title}" (${job.companyName}) vakansiyası ilə maraqlanıram. Zəhmət olmasa əlavə məlumat verərdiniz.`
    );
    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
  };

  // Handle Simple Quick Apply Submission
  const handleConfirmQuickApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickApplyJob) return;

    if (onQuickApply) {
      onQuickApply(quickApplyJob);
    }
    setQuickApplySuccess(true);
    setTimeout(() => {
      setQuickApplySuccess(false);
      setQuickApplyJob(null);
    }, 1800);
  };

  return (
    <div className="space-y-4">
      {/* ========================================================================= */}
      {/* 1. TOP BAR: COMPANY STORIES & INTEGRATED SEARCH/MODE BAR                  */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-3.5 sm:p-4 space-y-3">
        {/* Company Stories / Logotypes Carousel */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1 scrollbar-thin">
          <button
            type="button"
            onClick={() => {
              setSelectedCompany('Hamısı');
              setSelectedIndustry('Hamısı');
            }}
            className={`group shrink-0 flex flex-col items-center gap-1 p-1 rounded-xl transition-all cursor-pointer ${
              selectedCompany === 'Hamısı' && selectedIndustry === 'Hamısı' ? 'scale-105' : 'hover:scale-105 opacity-80 hover:opacity-100'
            }`}
          >
            <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-black text-xs transition-all ${
              selectedCompany === 'Hamısı' && selectedIndustry === 'Hamısı'
                ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-600 ring-offset-2'
                : 'bg-slate-100 text-slate-700 border border-slate-200'
            }`}>
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 truncate max-w-[60px]">Bütün</span>
          </button>

          {FEATURED_COMPANIES.map((company) => {
            const isSelected = selectedCompany.toLowerCase() === company.name.toLowerCase();
            return (
              <button
                key={company.name}
                type="button"
                onClick={() => {
                  setSelectedCompany(isSelected ? 'Hamısı' : company.name);
                }}
                className={`group shrink-0 flex flex-col items-center gap-1 p-1 rounded-xl transition-all cursor-pointer ${
                  isSelected ? 'scale-105' : 'hover:scale-105'
                }`}
                title={`${company.name} vakansiyaları`}
              >
                <div
                  className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl p-0.5 bg-white flex items-center justify-center transition-all ${
                    isSelected
                      ? 'ring-2 ring-blue-600 ring-offset-2 shadow-xs'
                      : company.isPartner
                      ? 'ring-2 ring-emerald-500/80 shadow-2xs'
                      : 'border border-slate-200 shadow-2xs hover:border-blue-400'
                  }`}
                >
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="w-full h-full object-cover rounded-lg"
                    referrerPolicy="no-referrer"
                  />
                  {company.isPartner && (
                    <span className="absolute -top-1 -right-1 px-1 py-0.2 bg-emerald-600 text-white rounded text-[7px] font-black uppercase">
                      VIP
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-bold max-w-[64px] truncate text-center ${
                  isSelected ? 'text-blue-600 font-extrabold' : 'text-slate-700 group-hover:text-slate-950'
                }`}>
                  {company.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Integrated Quick Search & View Switcher */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 pt-2 border-t border-slate-100">
          {/* Main search */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="top-quick-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Vəzifə, şirkət və ya açar sözlə axtarın..."
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* City selector */}
          <div className="md:col-span-3 relative">
            <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-xl text-xs font-semibold text-slate-800 outline-none transition-all cursor-pointer truncate shadow-2xs"
            >
              <option value="Hamısı">📍 Bütün Şəhərlər</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Rejim Switch & AI / Salary Trends */}
          <div className="md:col-span-3 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsAiModeActive(!isAiModeActive)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-2xs ${
                isAiModeActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
              }`}
              title="AI Ağıllı Axtarış"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isAiModeActive ? 'text-amber-300' : 'text-indigo-600'}`} />
              <span>AI Axtarış</span>
            </button>

            <div className="inline-flex p-0.5 bg-slate-100 rounded-xl border border-slate-200 shadow-2xs flex-1">
              <button
                type="button"
                onClick={() => handleSetViewMode('simple')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  viewMode === 'simple'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Zap className="w-3 h-3 text-amber-300" />
                <span>Sadə</span>
              </button>

              <button
                type="button"
                onClick={() => handleSetViewMode('detailed')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  viewMode === 'detailed'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>Ətraflı</span>
              </button>
            </div>

            {onOpenSalaryTrends && (
              <button
                type="button"
                onClick={onOpenSalaryTrends}
                title="Maaş Statistikası"
                className="p-2 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-center transition-all cursor-pointer shadow-2xs shrink-0"
              >
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </button>
            )}
          </div>
        </div>

        {/* AI SMART SEARCH BAR (Accessible directly from top) */}
        {isAiModeActive && (
          <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-slate-50 p-3.5 rounded-xl border border-indigo-200/90 space-y-2.5 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <Sparkles className="w-4 h-4 text-indigo-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRunAiSearch();
                  }}
                  placeholder={dict.jobExplorer.aiSearchPromptPlaceholder || 'Tələblərinizi yazın (Məs: Bakıda 1500+ remote backend developer)...'}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-indigo-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-xs font-medium"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleRunAiSearch()}
                  disabled={isAiSearching}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  {isAiSearching ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{dict.jobExplorer.searching || 'Axtarılır...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{dict.jobExplorer.runAiSearch || 'AI Axtarış'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleRunAiSearch(undefined, true)}
                  disabled={isAiSearching}
                  className="px-3 py-2 bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                >
                  <Bot className="w-3.5 h-3.5 text-indigo-600" />
                  <span>🎯 CV-yə görə</span>
                </button>
              </div>
            </div>

            {/* Quick AI Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="text-[11px] font-bold text-indigo-900 mr-1 flex items-center gap-1">
                Hazır Şablonlar:
              </span>
              {quickAiPrompts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if (p.isCV) {
                      handleRunAiSearch(undefined, true);
                    } else if (p.prompt) {
                      setAiPrompt(p.prompt);
                      handleRunAiSearch(p.prompt);
                    }
                  }}
                  className="px-2 py-0.5 bg-white hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-lg text-[11px] font-medium transition-colors cursor-pointer shadow-2xs"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MOBILE QUICK FILTER PILLS BAR (Shown only on mobile for instant 1-tap filtering) */}
        <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('Hamısı');
              setSelectedIndustry('Hamısı');
              setSelectedCompany('Hamısı');
              setSelectedCity('Hamısı');
              setMinSalaryFilter(0);
              setSearchQuery('');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1 ${
              activeFiltersCount === 0
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Zap className="w-3 h-3 text-amber-300" />
            <span>Hamısı</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileFilterModal('categories')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1 ${
              selectedCategory !== 'Hamısı'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>📁 Kateqoriyalar</span>
            {selectedCategory !== 'Hamısı' && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-300" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileFilterModal('companies')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1 ${
              selectedCompany !== 'Hamısı'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>🏛️ Şirkətlər</span>
            {selectedCompany !== 'Hamısı' && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-300" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileFilterModal('industries')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1 ${
              selectedIndustry !== 'Hamısı'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>🏢 Sahələr</span>
            {selectedIndustry !== 'Hamısı' && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-300" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileFilterModal('filters')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1 ${
              activeFiltersCount > 0
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Filter className="w-3 h-3" />
            <span>Filtrlər {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN 2-COLUMN LAYOUT: LEFT FILTERS + RIGHT VACANCIES (IMMEDIATE)       */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: DESKTOP FILTERS (Hidden on mobile for instant vacancy view)  */}
        {/* ========================================================================= */}
        <aside className="hidden lg:block lg:order-1 lg:col-span-4 xl:col-span-3 space-y-3.5">
          {/* Active Filter Chips & Reset */}
          {activeFiltersCount > 0 && (
            <div className="bg-blue-50/70 border border-blue-200/90 rounded-2xl p-3 space-y-2 shadow-2xs animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-blue-900 flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-blue-600" />
                  <span>Aktiv Filtrlər ({activeFiltersCount})</span>
                </span>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer hover:underline"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Sıfırla</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-1">
                {selectedCategory !== 'Hamısı' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white text-blue-800 text-[11px] font-bold border border-blue-200 shadow-2xs">
                    📁 {selectedCategory}
                    <button type="button" onClick={() => setSelectedCategory('Hamısı')} className="text-blue-400 hover:text-blue-700">✕</button>
                  </span>
                )}
                {selectedIndustry !== 'Hamısı' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white text-blue-800 text-[11px] font-bold border border-blue-200 shadow-2xs">
                    🏢 {selectedIndustry}
                    <button type="button" onClick={() => setSelectedIndustry('Hamısı')} className="text-blue-400 hover:text-blue-700">✕</button>
                  </span>
                )}
                {selectedCompany !== 'Hamısı' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white text-blue-800 text-[11px] font-bold border border-blue-200 shadow-2xs">
                    🏛️ {selectedCompany}
                    <button type="button" onClick={() => setSelectedCompany('Hamısı')} className="text-blue-400 hover:text-blue-700">✕</button>
                  </span>
                )}
                {selectedCity !== 'Hamısı' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white text-blue-800 text-[11px] font-bold border border-blue-200 shadow-2xs">
                    📍 {selectedCity}
                    <button type="button" onClick={() => setSelectedCity('Hamısı')} className="text-blue-400 hover:text-blue-700">✕</button>
                  </span>
                )}
                {minSalaryFilter > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white text-blue-800 text-[11px] font-bold border border-blue-200 shadow-2xs">
                    💰 {minSalaryFilter}+ AZN
                    <button type="button" onClick={() => setMinSalaryFilter(0)} className="text-blue-400 hover:text-blue-700">✕</button>
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white text-blue-800 text-[11px] font-bold border border-blue-200 shadow-2xs">
                    🔍 {searchQuery}
                    <button type="button" onClick={() => setSearchQuery('')} className="text-blue-400 hover:text-blue-700">✕</button>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* CARD 1: VƏZİFƏLƏRİN KATEQORİYASI (Job Categories) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-3.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xs">
                  📁
                </div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Vəzifə Kateqoriyaları
                </h3>
              </div>
              <span className="text-[11px] font-bold text-slate-500">
                {JOB_CATEGORIES.length}
              </span>
            </div>

            <div className="p-2 max-h-64 overflow-y-auto scrollbar-thin space-y-0.5">
              <button
                type="button"
                onClick={() => setSelectedCategory('Hamısı')}
                className={`w-full px-2.5 py-1.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                  selectedCategory === 'Hamısı'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>Bütün Kateqoriyalar</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  selectedCategory === 'Hamısı' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {vacancies.filter((v) => v.isApproved !== false).length}
                </span>
              </button>

              {JOB_CATEGORIES.map((cat) => {
                const count = categoryCounts[cat] || 0;
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(isSelected ? 'Hamısı' : cat)}
                    className={`w-full px-2.5 py-1.5 rounded-xl text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100 font-medium'
                    }`}
                  >
                    <span className="truncate pr-2">{cat}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold shrink-0 ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CARD 2: ŞİRKƏTLƏRİN KATEQORİYASI / SAHƏLƏRİ (Company Industries) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-3.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs">
                  🏢
                </div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Şirkətlərin Kateqoriyası
                </h3>
              </div>
              <span className="text-[11px] font-bold text-slate-500">
                {COMPANY_INDUSTRIES.length}
              </span>
            </div>

            <div className="p-2 max-h-56 overflow-y-auto scrollbar-thin space-y-0.5">
              <button
                type="button"
                onClick={() => setSelectedIndustry('Hamısı')}
                className={`w-full px-2.5 py-1.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                  selectedIndustry === 'Hamısı'
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>Bütün Sahələr</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  selectedIndustry === 'Hamısı' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {vacancies.filter((v) => v.isApproved !== false).length}
                </span>
              </button>

              {COMPANY_INDUSTRIES.map((ind) => {
                const count = industryStats[ind] || 0;
                const isSelected = selectedIndustry === ind;
                return (
                  <button
                    key={ind}
                    type="button"
                    onClick={() => setSelectedIndustry(isSelected ? 'Hamısı' : ind)}
                    className={`w-full px-2.5 py-1.5 rounded-xl text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white font-bold shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100 font-medium'
                    }`}
                  >
                    <span className="truncate pr-2">{ind}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold shrink-0 ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CARD 3: ŞİRKƏTLƏRİN ADI (Companies List with search) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-3.5 bg-slate-50/80 border-b border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs">
                    🏛️
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    Şirkətlərin Adı
                  </h3>
                </div>
                <span className="text-[11px] font-bold text-slate-500">
                  {companyListWithStats.length}
                </span>
              </div>

              {/* Mini Company Search Input */}
              <div className="relative">
                <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={companySearchQuery}
                  onChange={(e) => setCompanySearchQuery(e.target.value)}
                  placeholder="Şirkət axtar..."
                  className="w-full pl-7 pr-6 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-indigo-500"
                />
                {companySearchQuery && (
                  <button
                    type="button"
                    onClick={() => setCompanySearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            <div className="p-2 max-h-60 overflow-y-auto scrollbar-thin space-y-1">
              <button
                type="button"
                onClick={() => setSelectedCompany('Hamısı')}
                className={`w-full px-2.5 py-1.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                  selectedCompany === 'Hamısı'
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>Bütün Şirkətlər</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  selectedCompany === 'Hamısı' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {vacancies.filter((v) => v.isApproved !== false).length}
                </span>
              </button>

              {filteredCompaniesForSidebar.map((comp) => {
                const isSelected = selectedCompany.toLowerCase() === comp.name.toLowerCase();
                return (
                  <button
                    key={comp.name}
                    type="button"
                    onClick={() => setSelectedCompany(isSelected ? 'Hamısı' : comp.name)}
                    className={`w-full px-2.5 py-1.5 rounded-xl text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-bold shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <img
                        src={comp.logo}
                        alt={comp.name}
                        className="w-4 h-4 rounded object-cover border border-slate-200 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <span className="truncate">{comp.name}</span>
                      {comp.verified && (
                        <CheckCircle className={`w-3 h-3 shrink-0 ${isSelected ? 'text-white' : 'text-emerald-500'}`} />
                      )}
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold shrink-0 ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {comp.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CARD 4: ŞƏHƏR VƏ MAAŞ FİLTRİ */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-3.5 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <span>📍</span>
              <span>Şəhər və Əməkhaqqı</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Şəhər:</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-blue-500"
                >
                  <option value="Hamısı">📍 Bütün Şəhərlər</option>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Minimum Maaş:</label>
                <select
                  value={minSalaryFilter}
                  onChange={(e) => setMinSalaryFilter(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-blue-500"
                >
                  <option value={0}>💰 Bütün Maaşlar</option>
                  <option value={500}>500+ AZN</option>
                  <option value={800}>800+ AZN</option>
                  <option value={1000}>1,000+ AZN</option>
                  <option value={1500}>1,500+ AZN</option>
                  <option value={2000}>2,000+ AZN</option>
                  <option value={3000}>3,000+ AZN</option>
                </select>
              </div>
            </div>
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: VACANCIES FEED (TOP PRIORITY - IMMEDIATELY SEEN ON MOBILE)  */}
        {/* ========================================================================= */}
        <main className="order-1 lg:order-2 lg:col-span-8 xl:col-span-9 space-y-3.5">
          {/* Top Bar above Vacancies list */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Vakansiyalar
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                {filteredAndSortedVacancies.length} elan tapıldı
              </span>
            </div>

            {/* Sort & Order */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-bold hidden sm:inline">Sıralama:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
              >
                <option value="newest">🕒 Ən yeni elanlar</option>
                <option value="salary-desc">💰 Maaşa görə (çoxdan aza)</option>
                <option value="views-desc">👁️ Ən çox baxılanlar</option>
                <option value="title-asc">🔤 Vəzifə (A-Z)</option>
                <option value="company-asc">🏢 Şirkət (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Quick 1-Tap Profession Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {quickProfessions.map((prof) => {
              const isSelected = quickProfessionFilter === prof.id;
              return (
                <button
                  key={prof.id}
                  type="button"
                  onClick={() => setQuickProfessionFilter(prof.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs'
                  }`}
                >
                  <span>{prof.icon}</span>
                  <span>{prof.label}</span>
                </button>
              );
            })}
          </div>

          {/* ========================================================================= */}
          {/* 2. MODE A: SIMPLE & ACCESSIBLE VIEW (JOBSEARCH STYLE ROWS)                */}
          {/* ========================================================================= */}
          {viewMode === 'simple' && (
            <div className="space-y-2.5 animate-fade-in">
              {filteredAndSortedVacancies.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3 shadow-sm">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                    <Search className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">{dict.jobExplorer.noJobsFound}</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    {dict.jobExplorer.noJobsFoundDesc}
                  </p>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
                  >
                    {dict.jobExplorer.resetFilters}
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredAndSortedVacancies.map((job) => {
                    const isSaved = savedJobIds.includes(job.id);
                    const isRecentlyPosted = (() => {
                      try {
                        const today = new Date('2026-08-28').getTime();
                        const pDate = new Date(job.postedDate).getTime();
                        return (today - pDate) / (1000 * 60 * 60 * 24) <= 2;
                      } catch {
                        return false;
                      }
                    })();

                    return (
                      <div
                        key={job.id}
                        id={`simple-job-row-${job.id}`}
                        onClick={() => onSelectVacancy(job)}
                        className="group relative bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-blue-400 rounded-2xl p-3 sm:p-4 transition-all duration-150 cursor-pointer shadow-2xs hover:shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4"
                      >
                        {/* Left & Middle Info Block */}
                        <div className="flex items-start sm:items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                          {/* Company Logo with chic border & fallback */}
                          <div className="relative shrink-0">
                            <img
                              src={job.companyLogo}
                              alt={job.companyName}
                              className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-cover border border-slate-200 bg-white p-0.5 shadow-2xs group-hover:scale-105 transition-transform"
                              referrerPolicy="no-referrer"
                            />
                            {job.companyVerified && (
                              <span 
                                className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[8px] font-bold border-2 border-white shadow-2xs"
                                title="Təsdiqlənmiş Şirkət"
                              >
                                ✓
                              </span>
                            )}
                          </div>

                          {/* Job Title, Badges & Company Meta */}
                          <div className="min-w-0 flex-1">
                            {/* Title Row + Badges */}
                            <div className="flex flex-wrap items-center gap-1.5">
                              <h3 className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                                {job.title}
                              </h3>

                              {job.isFeatured && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md text-[9px] font-black bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs shrink-0">
                                  ⭐ PREMİUM
                                </span>
                              )}

                              {isRecentlyPosted && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md text-[9px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                                  ⚡ YENİ
                                </span>
                              )}
                            </div>

                            {/* Company & Details Row */}
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-600 mt-0.5 font-medium">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCompany(job.companyName);
                                }}
                                className="font-bold text-slate-800 hover:text-blue-600 hover:underline"
                              >
                                {job.companyName}
                              </button>
                              <span className="text-slate-300">•</span>
                              <span className="flex items-center gap-1 text-slate-500">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {job.city}
                              </span>
                              <span className="text-slate-300">•</span>
                              <span className="flex items-center gap-1 text-slate-500">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {job.employmentType}
                              </span>
                              <span className="text-slate-300 hidden sm:inline">•</span>
                              <span className="hidden sm:inline-block px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded text-[10px] font-semibold">
                                {job.category}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right Meta & Action Items */}
                        <div className="flex flex-wrap md:flex-nowrap items-center justify-between md:justify-end gap-2 sm:gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                          {/* Salary Badge */}
                          <div className="shrink-0">
                            {job.hideSalary ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200">
                                💰 {dict.jobExplorer.negotiableSalary}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/90 font-black text-xs shadow-2xs">
                                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{job.minSalary} - {job.maxSalary} {job.currency}</span>
                              </span>
                            )}
                          </div>

                          {/* Views Count & Date Tag */}
                          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium shrink-0">
                            <span className="inline-flex items-center gap-1 text-slate-400" title="Baxış sayı">
                              <Eye className="w-3.5 h-3.5 text-slate-400" />
                              <span>{formatViewsCount(job.viewsCount)}</span>
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold whitespace-nowrap">
                              {formatJobDate(job.postedDate)}
                            </span>
                          </div>

                          {/* Action Buttons (1-Click Apply, WhatsApp, Bookmark) */}
                          <div className="flex items-center gap-1 shrink-0 ml-auto md:ml-0">
                            {/* 1-Click Fast Apply */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setQuickApplyJob(job);
                              }}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-black text-xs flex items-center gap-1 transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                              title="1 Kliklə Müraciət Et"
                            >
                              <Send className="w-3 h-3 text-amber-300" />
                              <span>1 Klik</span>
                            </button>

                            {/* Direct WhatsApp Contact */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenWhatsApp(job);
                              }}
                              className="p-1.5 sm:px-2.5 sm:py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                              title="WhatsApp ilə birbaşa əlaqə"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="hidden sm:inline">WhatsApp</span>
                            </button>

                            {/* Direct Call Button if Phone available */}
                            {job.contactPhone && (
                              <a
                                href={`tel:${job.contactPhone}`}
                                onClick={(e) => e.stopPropagation()}
                                className="p-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 rounded-lg font-bold text-xs flex items-center justify-center transition-all"
                                title={`Zəng et: ${job.contactPhone}`}
                              >
                                <Phone className="w-3.5 h-3.5 text-blue-600" />
                              </a>
                            )}

                            {/* Save Bookmark */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleBookmark(job.id);
                              }}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                isSaved
                                  ? 'bg-amber-50 border-amber-300 text-amber-500'
                                  : 'border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                              }`}
                              title={isSaved ? dict.jobExplorer.saved : dict.jobExplorer.saveJob}
                            >
                              <Bookmark className="w-3.5 h-3.5" fill={isSaved ? 'currentColor' : 'none'} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. MODE B: DETAILED ADVANCED VIEW                                         */}
          {/* ========================================================================= */}
          {viewMode === 'detailed' && (
            <div className="space-y-4 animate-fade-in">
              {/* TOP VACANCY DISCOVERY & AI SEARCH STATION */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-4">
                {/* Search Mode Selector: Quick vs AI Smart */}
                <div className="flex items-center gap-2 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 w-fit">
                  <button
                    type="button"
                    onClick={() => setIsAiModeActive(false)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      !isAiModeActive
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 text-blue-600" />
                    <span>{dict.jobExplorer.quickSearch}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsAiModeActive(true)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isAiModeActive
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isAiModeActive ? 'text-amber-300' : 'text-indigo-600'}`} />
                    <span>{dict.jobExplorer.aiSearch}</span>
                  </button>
                </div>

                {/* AI SMART SEARCH BOX */}
                {isAiModeActive && (
                  <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/70 to-slate-50 p-4 rounded-xl border border-indigo-200/90 space-y-3 animate-fade-in">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <div className="relative flex-1">
                        <Sparkles className="w-4 h-4 text-indigo-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRunAiSearch();
                          }}
                          placeholder={dict.jobExplorer.aiSearchPromptPlaceholder}
                          className="w-full pl-10 pr-4 py-2.5 bg-white border border-indigo-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-xs"
                        />
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleRunAiSearch()}
                          disabled={isAiSearching}
                          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                        >
                          {isAiSearching ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>{dict.jobExplorer.searching}</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>{dict.jobExplorer.runAiSearch}</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRunAiSearch(undefined, true)}
                          disabled={isAiSearching}
                          className="px-3.5 py-2.5 bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                        >
                          <Bot className="w-4 h-4 text-indigo-600" />
                          <span>🎯 {dict.jobExplorer.analyzeMyCV}</span>
                        </button>
                      </div>
                    </div>

                    {/* Quick AI Presets */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] font-bold text-indigo-900 mr-1 flex items-center gap-1">
                        {language === 'en' ? 'Templates:' : language === 'ru' ? 'Шаблоны:' : 'Hazır Şablonlar:'}
                      </span>
                      {quickAiPrompts.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            if (p.isCV) {
                              handleRunAiSearch(undefined, true);
                            } else if (p.prompt) {
                              setAiPrompt(p.prompt);
                              handleRunAiSearch(p.prompt);
                            }
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-lg text-xs font-medium transition-colors cursor-pointer shadow-2xs"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Detailed Cards Grid */}
              {filteredAndSortedVacancies.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3 shadow-sm">
                  <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
                    <Search className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">{dict.jobExplorer.noJobsFound}</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    {dict.jobExplorer.noJobsFoundDesc}
                  </p>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
                  >
                    {dict.jobExplorer.resetFilters}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredAndSortedVacancies.map((job) => {
                    const isSaved = savedJobIds.includes(job.id);
                    const aiMatch = aiMatchesMap[job.id];
                    return (
                      <div
                        key={job.id}
                        onClick={() => onSelectVacancy(job)}
                        className={`group bg-white rounded-2xl border p-4 sm:p-5 transition-all duration-200 hover:shadow-md cursor-pointer flex flex-col justify-between relative ${
                          job.isFeatured
                            ? 'border-amber-300/80 bg-gradient-to-b from-amber-50/20 via-white to-white'
                            : 'border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <img
                                src={job.companyLogo}
                                alt={job.companyName}
                                className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-white p-0.5 shadow-2xs group-hover:scale-105 transition-transform"
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <h3 className="font-black text-slate-900 group-hover:text-blue-600 transition-colors text-sm line-clamp-1">
                                  {job.title}
                                </h3>
                                <p className="text-xs text-slate-600 font-semibold">{job.companyName}</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleBookmark(job.id);
                              }}
                              className="text-slate-400 hover:text-amber-500 p-1"
                            >
                              <Bookmark className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
                            </button>
                          </div>

                          <div className="flex flex-wrap gap-1.5 text-xs text-slate-500">
                            <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md">
                              <MapPin className="w-3 h-3" /> {job.city}
                            </span>
                            <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md">
                              <Clock className="w-3 h-3" /> {job.employmentType}
                            </span>
                          </div>

                          {/* AI Match percentage badge if calculated */}
                          {aiMatch && (
                            <div className="p-2 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between text-xs font-bold text-indigo-900">
                              <span className="flex items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                                <span>AI Uyğunluq:</span>
                              </span>
                              <span className="text-indigo-700 font-black">
                                {aiMatch.matchScore}%
                              </span>
                            </div>
                          )}

                          {/* Salary Tag */}
                          <div>
                            {job.hideSalary ? (
                              <span className="text-xs font-semibold text-slate-500">Maaş razılaşma ilə</span>
                            ) : (
                              <span className="text-xs sm:text-sm font-black text-emerald-700">
                                {job.minSalary} - {job.maxSalary} {job.currency}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-[11px] text-slate-400">
                            {formatJobDate(job.postedDate)}
                          </span>
                          <span className="text-blue-600 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                            Ətraflı bax <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* 4. WHY US? / NİYƏ BİZ? (3 Sütunlu Korporativ Üstünlüklər Bölməsi)         */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 lg:p-10 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-black tracking-wide uppercase border border-blue-100">
            <Award className="w-3.5 h-3.5" />
            <span>NİYƏ {brandAcronym || 'JOBİA.AZ'}?</span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
            Karyeranızı Etibarlı Əllərə Əmanət Edin
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Azərbaycanda iş axtarışını sürətli, şəffaf və peşəkar edən 3 əsas dəyərimiz
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Card 1: 100% Yoxlanılmış Şirkətlər */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3.5 hover:shadow-xs transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-100/80 text-blue-700 flex items-center justify-center border border-blue-200 shadow-2xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              100% Yoxlanılmış Şirkətlər
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              Yalnız rəsmi VÖEN və hüquqi qeydiyyatı təsdiq olunmuş korporativ şirkətlərin elanları dərc olunur. Saxta elanlara və vasitəçi komissiyalarına qətiyyən yer verilmir.
            </p>
          </div>

          {/* Card 2: Şəffaf Maaşlar & Birbaşa Əlaqə */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3.5 hover:shadow-xs transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center border border-emerald-200 shadow-2xs">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Şəffaf Maaşlar və Birbaşa Əlaqə
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              Bazar standartlarına uyğun dəqiq maaş intervalları, 1-kliklə müraciət, birbaşa WhatsApp və rəsmi rəqəmsal iş təklifi (Job Offer) imkanı.
            </p>
          </div>

          {/* Card 3: AI Dəstəkli Dəqiq Uyğunlaşdırma */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3.5 hover:shadow-xs transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-100/80 text-purple-700 flex items-center justify-center border border-purple-200 shadow-2xs">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Süni İntellekt Dəstəyi
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              CV-nizin vakansiyaya uyğunluq faizini dərhal görün, ATS optimallaşdırması ilə şirkətlərin diqqətini çəkin və müsahibəyə hazırlaşın.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. FAST 1-CLICK QUICK APPLY MODAL FOR SIMPLE VIEW                          */}
      {/* ========================================================================= */}
      {quickApplyJob && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-emerald-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-black">
                  ⚡
                </div>
                <div>
                  <h3 className="text-sm font-black">1 Kliklə Sürətli Müraciət</h3>
                  <p className="text-xs text-emerald-100 truncate max-w-xs">{quickApplyJob.title}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQuickApplyJob(null)}
                className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {quickApplySuccess ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center">
                  <Check className="w-8 h-8" />
                </div>
                <h4 className="text-base font-black text-slate-900">Müraciətiniz Qəbul Olundu!</h4>
                <p className="text-xs text-slate-500">
                  {quickApplyJob.companyName} şirkəti sizinlə ən qısa zamanda əlaqə saxlayacaqdır.
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmQuickApply} className="p-5 space-y-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                  <img
                    src={quickApplyJob.companyLogo}
                    alt={quickApplyJob.companyName}
                    className="w-10 h-10 rounded-lg object-cover border border-slate-200 bg-white"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{quickApplyJob.title}</h4>
                    <p className="text-xs text-slate-500 font-medium">
                      {quickApplyJob.companyName} • {quickApplyJob.city}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Adınız və Soyadınız:
                    </label>
                    <input
                      type="text"
                      required
                      value={quickApplicantName}
                      onChange={(e) => setQuickApplicantName(e.target.value)}
                      placeholder="Məs: Rəşad Əliyev"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Əlaqə Telefonunuz (WhatsApp):
                    </label>
                    <input
                      type="tel"
                      required
                      value={quickApplicantPhone}
                      onChange={(e) => setQuickApplicantPhone(e.target.value)}
                      placeholder="Məs: +994 50 123 45 67"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setQuickApplyJob(null)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Ləğv et
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-black rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Müraciəti Tamamla</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MOBILE DEDICATED SLIDE-OVER / BOTTOM SHEET FILTER MODAL               */}
      {/* ========================================================================= */}
      {mobileFilterModal !== 'none' && (
        <div className="fixed inset-0 z-50 lg:hidden bg-slate-900/60 backdrop-blur-xs flex flex-col justify-end sm:justify-center p-0 sm:p-4 animate-fade-in">
          <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header with Tabs */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-black">
                  {mobileFilterModal === 'categories' && '📁 Vəzifə Kateqoriyaları'}
                  {mobileFilterModal === 'companies' && '🏛️ Şirkətlər'}
                  {mobileFilterModal === 'industries' && '🏢 Şirkət Sahələri'}
                  {mobileFilterModal === 'filters' && '⚙️ Bütün Filtrlər'}
                  {mobileFilterModal === 'ai' && '🤖 AI Ağıllı Axtarış'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setMobileFilterModal('none')}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Fast Sub-tabs */}
            <div className="flex items-center gap-1 p-2 bg-slate-100 border-b border-slate-200 overflow-x-auto shrink-0 scrollbar-none text-xs font-bold">
              <button
                type="button"
                onClick={() => setMobileFilterModal('categories')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  mobileFilterModal === 'categories' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                📁 Kateqoriyalar
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterModal('companies')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  mobileFilterModal === 'companies' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                🏛️ Şirkətlər
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterModal('industries')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  mobileFilterModal === 'industries' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                🏢 Sahələr
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterModal('filters')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  mobileFilterModal === 'filters' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                ⚙️ Parametrlər
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              {/* VIEW 1: CATEGORIES */}
              {mobileFilterModal === 'categories' && (
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory('Hamısı');
                      setMobileFilterModal('none');
                    }}
                    className={`w-full p-3 rounded-xl text-left text-xs font-bold flex items-center justify-between transition-all ${
                      selectedCategory === 'Hamısı'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-800 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <span>📁 Bütün Kateqoriyalar</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      selectedCategory === 'Hamısı' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {vacancies.length}
                    </span>
                  </button>

                  {JOB_CATEGORIES.map((cat) => {
                    const count = categoryCounts[cat] || 0;
                    const isSelected = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(isSelected ? 'Hamısı' : cat);
                          setMobileFilterModal('none');
                        }}
                        className={`w-full p-3 rounded-xl text-left text-xs font-medium flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white font-bold shadow-xs'
                            : 'bg-slate-50 text-slate-800 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        <span className="truncate pr-2">{cat}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* VIEW 2: COMPANIES */}
              {mobileFilterModal === 'companies' && (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={companySearchQuery}
                      onChange={(e) => setCompanySearchQuery(e.target.value)}
                      placeholder="Şirkət adı üzrə axtar..."
                      className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:border-blue-500 font-medium"
                    />
                    {companySearchQuery && (
                      <button
                        type="button"
                        onClick={() => setCompanySearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="space-y-1.5 max-h-72 overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCompany('Hamısı');
                        setMobileFilterModal('none');
                      }}
                      className={`w-full p-3 rounded-xl text-left text-xs font-bold flex items-center justify-between transition-all ${
                        selectedCompany === 'Hamısı'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-50 text-slate-800 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <span>🏛️ Bütün Şirkətlər</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        selectedCompany === 'Hamısı' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {vacancies.length}
                      </span>
                    </button>

                    {filteredCompaniesForSidebar.map((comp) => {
                      const isSelected = selectedCompany.toLowerCase() === comp.name.toLowerCase();
                      return (
                        <button
                          key={comp.name}
                          type="button"
                          onClick={() => {
                            setSelectedCompany(isSelected ? 'Hamısı' : comp.name);
                            setMobileFilterModal('none');
                          }}
                          className={`w-full p-3 rounded-xl text-left text-xs flex items-center justify-between transition-all ${
                            isSelected
                              ? 'bg-blue-600 text-white font-bold shadow-xs'
                              : 'bg-slate-50 text-slate-800 hover:bg-slate-100 border border-slate-200 font-medium'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate pr-2">
                            <img
                              src={comp.logo}
                              alt={comp.name}
                              className="w-5 h-5 rounded object-cover border border-slate-200 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <span className="truncate">{comp.name}</span>
                            {comp.verified && (
                              <CheckCircle className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-emerald-500'}`} />
                            )}
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {comp.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* VIEW 3: INDUSTRIES */}
              {mobileFilterModal === 'industries' && (
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedIndustry('Hamısı');
                      setMobileFilterModal('none');
                    }}
                    className={`w-full p-3 rounded-xl text-left text-xs font-bold flex items-center justify-between transition-all ${
                      selectedIndustry === 'Hamısı'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-800 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <span>🏢 Bütün Sahələr</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      selectedIndustry === 'Hamısı' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {vacancies.length}
                    </span>
                  </button>

                  {COMPANY_INDUSTRIES.map((ind) => {
                    const count = industryStats[ind] || 0;
                    const isSelected = selectedIndustry === ind;
                    return (
                      <button
                        key={ind}
                        type="button"
                        onClick={() => {
                          setSelectedIndustry(isSelected ? 'Hamısı' : ind);
                          setMobileFilterModal('none');
                        }}
                        className={`w-full p-3 rounded-xl text-left text-xs flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-emerald-600 text-white font-bold shadow-xs'
                            : 'bg-slate-50 text-slate-800 hover:bg-slate-100 border border-slate-200 font-medium'
                        }`}
                      >
                        <span className="truncate pr-2">{ind}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* VIEW 4: ALL ADVANCED FILTERS */}
              {mobileFilterModal === 'filters' && (
                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">📍 Şəhər:</label>
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 outline-none"
                    >
                      <option value="Hamısı">Bütün Şəhərlər</option>
                      {CITIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">💰 Minimum Əməkhaqqı:</label>
                    <select
                      value={minSalaryFilter}
                      onChange={(e) => setMinSalaryFilter(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 outline-none"
                    >
                      <option value={0}>Bütün Maaşlar</option>
                      <option value={500}>500+ AZN</option>
                      <option value={800}>800+ AZN</option>
                      <option value={1000}>1,000+ AZN</option>
                      <option value={1500}>1,500+ AZN</option>
                      <option value={2000}>2,000+ AZN</option>
                      <option value={3000}>3,000+ AZN</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">🕒 Dərc Olunma Vaxtı:</label>
                    <select
                      value={postedDateFilter}
                      onChange={(e) => setPostedDateFilter(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 outline-none"
                    >
                      <option value="all">Bütün dövr</option>
                      <option value="1_day">Son 24 saat</option>
                      <option value="3_days">Son 3 gün</option>
                      <option value="1_week">Son 1 həftə</option>
                      <option value="2_weeks">Son 2 həftə</option>
                    </select>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-200">
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="text-xs font-bold text-rose-600 hover:underline"
                    >
                      Filtrləri Sıfırla
                    </button>
                    <button
                      type="button"
                      onClick={() => setMobileFilterModal('none')}
                      className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-black shadow-xs"
                    >
                      Tətbiq et ({filteredAndSortedVacancies.length} elan)
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Close */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">
                {filteredAndSortedVacancies.length} vakansiya tapıldı
              </span>
              <button
                type="button"
                onClick={() => setMobileFilterModal('none')}
                className="px-4 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Vakansiyalara Bax
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
