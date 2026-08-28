export type UserRole = 'candidate' | 'business' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  companyId?: string;
  companyName?: string;
  companyDescription?: string;
  avatarUrl?: string;
  status: 'active' | 'suspended' | 'pending';
  emailVerified?: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface AuthSession {
  token: string;
  user: User;
  expiresAt: string;
}

// -------------------------------------------------------------
// CANDIDATE PROFILE (STORED IN FIRESTORE candidateProfiles/{uid})
// -------------------------------------------------------------
export interface CandidateProfile {
  id: string; // matches auth user id
  userId: string;
  fullName: string;
  professionalTitle: string;
  profilePhoto?: string;
  about: string;
  phone: string;
  email: string;
  location: string;
  skills: string[];
  languages: LanguageItem[];
  education: EducationItem[];
  workExperience: ExperienceItem[];
  certifications: CertificateItem[];
  expectedSalary?: number;
  preferredEmploymentType?: string;
  preferredLocation?: string;
  cvUrl?: string;
  cvFileName?: string;
  profileVisibility: 'public' | 'private';
  createdAt: string;
  updatedAt: string;
}

// -------------------------------------------------------------
// NOTIFICATION TYPE (STORED IN FIRESTORE notifications/{id})
// -------------------------------------------------------------
export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 
    | 'application_submitted' 
    | 'status_changed' 
    | 'interview_invite' 
    | 'job_offer' 
    | 'company_verification' 
    | 'vacancy_approval' 
    | 'new_applicant'
    | 'general';
  isRead: boolean;
  link?: string;
  data?: Record<string, any>;
  createdAt: string;
}

// -------------------------------------------------------------
// SUBSCRIPTION & MONETIZATION TYPES
// -------------------------------------------------------------

export type EmployerPlanTier = 'FREE' | 'PRO' | 'BUSINESS';
export type CandidatePlanTier = 'FREE' | 'PREMIUM';
export type PlanTier = EmployerPlanTier | CandidatePlanTier;

export type SubscriptionStatus = 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PENDING';
export type BillingCycle = 'monthly' | 'yearly';

export interface PlanFeatureLimit {
  maxActiveJobs: number;
  canUseAICandidateMatching: boolean;
  canUseAIInterviewSummary: boolean;
  canGenerateJobOffers: boolean;
  canSearchCandidateDatabase: boolean;
  canExportCandidateData: boolean;
  hasPriorityListing: boolean;
  hasTeamMembers: boolean;
  
  // Candidate limits
  canUseAIATSAnalysis: boolean;
  canUseAIInterviewPrep: boolean;
  hasAllCVTemplates: boolean;
  hasPriorityApplicationBadge: boolean;
  canUseSalaryTrendsIntelligence: boolean;
}

export interface SubscriptionPlan {
  id: string;
  role: 'candidate' | 'business';
  tier: PlanTier;
  name: string;
  tagline: string;
  priceMonthly: number; // in AZN
  priceYearly: number; // in AZN per month when billed annually
  features: string[];
  limits: PlanFeatureLimit;
  badge?: string;
  isPopular?: boolean;
}

export interface UserSubscription {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  role: UserRole;
  planId: string;
  tier: PlanTier;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  startDate: string;
  endDate: string;
  amount: number;
  currency: 'AZN';
  paymentProvider: 'MOCK_PAYMENT' | 'STRIPE' | 'AZERI_GATEWAY';
  paymentId: string;
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentTransaction {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  subscriptionId: string;
  planName: string;
  amount: number;
  currency: 'AZN';
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  paymentMethod: string;
  cardLast4?: string;
  transactionDate: string;
  failureReason?: string;
}

export type EmploymentType = 'Tam ştat' | 'Yarım ştat' | 'Hibrid' | 'Uzaqdan (Remote)' | 'Təcrübə proqramı';

export type ExperienceLevel = 'Təcrübəsiz / Junior' | 'Orta (Mid-level, 1-3 il)' | 'Baş (Senior, 3-5+ il)' | 'Rəhbər / Lead';

export type ApplicationStatus = 'Müraciət edildi' | 'Baxıldı' | 'Müsahibəyə dəvət' | 'Təklif verildi' | 'Qəbul edildi' | 'İmtina edildi';

export interface Company {
  id: string;
  name: string;
  logo: string;
  verified: boolean;
  verificationStatus?: 'pending' | 'verified' | 'rejected' | 'suspended';
  industry: string;
  location: string;
  address?: string;
  website?: string;
  email: string;
  phone?: string;
  hrContactName?: string;
  hrContactPosition?: string;
  description: string;
  employeeCount: string;
  activeJobsCount: number;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  requireOfferApproval?: boolean;
}

export type VacancyStatus = 'draft' | 'pending_review' | 'published' | 'rejected' | 'paused' | 'closed';

export interface Vacancy {
  id: string;
  title: string;
  department?: string;
  category: string;
  companyId: string;
  companyName: string;
  companyLogo: string;
  companyVerified: boolean;
  city: string;
  location?: string;
  workplaceType?: 'remote' | 'hybrid' | 'on-site';
  employmentType: EmploymentType;
  experienceLevel: ExperienceLevel;
  education?: string;
  minSalary?: number;
  maxSalary?: number;
  currency: string;
  hideSalary?: boolean;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  skills: string[];
  postedDate: string;
  deadline: string;
  status?: VacancyStatus;
  isFeatured?: boolean;
  isApproved?: boolean; // For admin moderation
  viewsCount: number;
  applicantsCount: number;
  contactPhone?: string;
  contactWhatsapp?: string;
  isBlueCollarFriendly?: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  current: boolean;
  gpa?: string;
}

export interface SkillItem {
  id: string;
  name: string;
  level: 'Başlanğıc' | 'Orta' | 'Yaxşı' | 'Əla / Ekspert';
  category: 'Texniki' | 'Soft skill' | 'Alət / Proqram';
}

export interface LanguageItem {
  id: string;
  language: string;
  proficiency: 'A1-A2 (Başlanğıc)' | 'B1-B2 (Orta/İşgüzar)' | 'C1-C2 (Sərbəst)' | 'Ana dili';
}

export interface ProjectItem {
  id: string;
  title: string;
  link?: string;
  description: string;
  technologies: string[];
}

export interface CertificateItem {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  credentialUrl?: string;
}

export interface CVData {
  id: string;
  title: string;
  lastUpdated: string;
  personalInfo: {
    fullName: string;
    jobTitle: string;
    email: string;
    phone: string;
    address: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
    summary: string;
    photoUrl?: string;
  };
  experiences: ExperienceItem[];
  education: EducationItem[];
  skills: SkillItem[];
  languages: LanguageItem[];
  projects: ProjectItem[];
  certificates: CertificateItem[];
}

export type CVTemplateType = 'modern-emerald' | 'classic-corporate' | 'minimal-indigo' | 'slate-tech';

export interface Application {
  id: string;
  jobId?: string;
  vacancyId: string;
  vacancyTitle: string;
  companyId: string;
  companyName: string;
  companyLogo: string;
  candidateId?: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  candidatePhoto?: string;
  appliedDate: string;
  status: ApplicationStatus;
  cvData: CVData;
  cvUrl?: string;
  coverNote?: string;
  matchScore?: number;
  matchHighlights?: string[];
  recruiterNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// -------------------------------------------------------------
// INTERVIEW & JOB OFFER WORKFLOW TYPES
// -------------------------------------------------------------

export type HiringDecision = 'Reject' | 'Hold' | 'Second Interview' | 'Hire';

export type OfferEmploymentType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship';

export type ProbationPeriod = 'None' | '1 month' | '2 months' | '3 months';

export type OfferStatus = 
  | 'DRAFT'
  | 'GENERATED'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'SENT'
  | 'VIEWED'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'SEND_FAILED'
  | 'EXPIRED';

export type AuditActionType =
  | 'INTERVIEW_COMPLETED'
  | 'HIRING_DECISION_MADE'
  | 'OFFER_CREATED'
  | 'OFFER_GENERATED'
  | 'OFFER_EDITED'
  | 'OFFER_APPROVED'
  | 'OFFER_SENT'
  | 'OFFER_VIEWED'
  | 'OFFER_ACCEPTED'
  | 'OFFER_DECLINED'
  | 'OFFER_RESENT';

export interface InterviewEvaluation {
  technicalSkills: number;
  relevantExperience: number;
  communication: number;
  problemSolving: number;
  teamwork: number;
  leadership: number;
  culturalFit: number;
  motivation: number;
  overallScore: number;
  strengths: string;
  weaknesses: string;
  interviewNotes: string;
  redFlags?: string;
  overallRecommendation: string;
  aiSummary?: string;
}

export interface InterviewRecord {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  position: string;
  department: string;
  interviewer: string;
  interviewDate: string;
  evaluation: InterviewEvaluation;
  decision: HiringDecision;
  createdAt: string;
  updatedAt: string;
}

export interface JobOfferDetails {
  position: string;
  department: string;
  employmentType: OfferEmploymentType;
  workLocation: string;
  startDate: string;
  grossSalary: number;
  netSalary: number;
  probationPeriod: ProbationPeriod;
  workingSchedule: string;
  annualLeave: string;
  bonus: string;
  benefits: string[];
  additionalTerms: string;
}

export interface JobOffer {
  id: string;
  applicationId?: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  companyId: string;
  companyName: string;
  companyLogo: string;
  companyAddress: string;
  companyEmail: string;
  companyPhone: string;
  hrContactPerson: string;
  hrContactPosition: string;
  
  // Offer core terms
  position: string;
  department: string;
  employmentType: OfferEmploymentType;
  workLocation: string;
  startDate: string;
  grossSalary: number;
  netSalary: number;
  probationPeriod: ProbationPeriod;
  workingSchedule: string;
  annualLeave: string;
  bonus: string;
  benefits: string[];
  additionalTerms: string;
  
  // AI Generation & Document
  templateId: string;
  templateName?: string;
  language: 'az' | 'en';
  generatedContent?: string;
  customNotes?: string;
  
  // Status & Security
  status: OfferStatus;
  secureToken: string;
  pdfDataUrl?: string;
  
  // Workflow timestamps & actors
  createdBy: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  viewedAt?: string;
  acceptedAt?: string;
  declinedAt?: string;
  declineReason?: {
    category: 'Salary' | 'Position' | 'Start Date' | 'Another Offer' | 'Personal Reasons' | 'Other';
    text?: string;
  };
  lastSendError?: string;
}

export interface JobOfferTemplate {
  id: string;
  name: string;
  description: string;
  language: 'az' | 'en';
  content: string;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface OfferAuditLog {
  id: string;
  offerId: string;
  candidateName: string;
  action: AuditActionType;
  user: string;
  timestamp: string;
  details: string;
  prevValue?: string;
  newValue?: string;
}

export interface CVAnalysisResult {
  overallScore: number;
  atsScore: number;
  strengths: string[];
  weaknesses: string[];
  missingKeywords: string[];
  actionableFeedback: {
    section: string;
    issue: string;
    recommendation: string;
    priority: 'Yüksək' | 'Orta' | 'Məsləhət';
  }[];
  marketCompetitiveness: string;
  suggestedJobTitles: string[];
  summaryFeedback: string;
}

export interface InterviewQuestion {
  category: 'Texniki' | 'Davranış və Situasiya' | 'Şirkət Uyğunluğu';
  question: string;
  whyAsked: string;
  suggestedAnswerTip: string;
  sampleAnswerAz: string;
}

export interface SalaryHistoricalPoint {
  period: string;
  minSalary: number;
  avgSalary: number;
  maxSalary: number;
  openingsCount: number;
}

export interface ExperienceSalaryBreakdown {
  level: string;
  avgSalary: number;
  minSalary: number;
  maxSalary: number;
  sampleSize: number;
}

export interface RoleSalaryStats {
  roleId: string;
  roleName: string;
  category: string;
  currentAvgSalary: number;
  currentMinSalary: number;
  currentMaxSalary: number;
  yearlyGrowthPct: number;
  demandLevel: 'Çox Yüksək' | 'Yüksək' | 'Orta' | 'Stabil';
  experienceBreakdown: ExperienceSalaryBreakdown[];
  trendHistory: SalaryHistoricalPoint[];
  topSkillsValue: { skill: string; salaryBoost: string }[];
  cityComparison: { city: string; avgSalary: number }[];
  description: string;
}
