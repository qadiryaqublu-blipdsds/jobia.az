import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  increment 
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  Vacancy, 
  Company, 
  Application, 
  JobOffer, 
  CandidateProfile, 
  AppNotification, 
  User 
} from '../types';

/* ========================================================================= */
/* 1. REAL VACANCIES / JOBS FIRESTORE SERVICE                                */
/* ========================================================================= */

/**
 * Fetch all published vacancies for candidates and visitors
 */
export async function getPublishedVacancies(): Promise<Vacancy[]> {
  try {
    const q = query(
      collection(db, 'jobs'),
      where('status', '==', 'published')
    );
    const snap = await getDocs(q);
    const list: Vacancy[] = [];
    snap.forEach((d) => {
      list.push({ ...d.data(), id: d.id } as Vacancy);
    });
    return list;
  } catch (err) {
    console.error('Error fetching published jobs:', err);
    return [];
  }
}

/**
 * Realtime listener for published vacancies
 */
export function subscribeToPublishedVacancies(callback: (jobs: Vacancy[]) => void) {
  const q = query(
    collection(db, 'jobs'),
    where('status', '==', 'published')
  );
  return onSnapshot(q, (snap) => {
    const list: Vacancy[] = [];
    snap.forEach((d) => {
      list.push({ ...d.data(), id: d.id } as Vacancy);
    });
    callback(list);
  }, (err) => {
    console.error('Snapshot error for published jobs:', err);
    callback([]);
  });
}

/**
 * Fetch company's own vacancies (for employer dashboard)
 */
export async function getCompanyVacancies(companyId: string): Promise<Vacancy[]> {
  if (!companyId) return [];
  try {
    const q = query(
      collection(db, 'jobs'),
      where('companyId', '==', companyId)
    );
    const snap = await getDocs(q);
    const list: Vacancy[] = [];
    snap.forEach((d) => {
      list.push({ ...d.data(), id: d.id } as Vacancy);
    });
    return list;
  } catch (err) {
    console.error('Error fetching company jobs:', err);
    return [];
  }
}

/**
 * Create or save new vacancy
 */
export async function saveVacancyToFirestore(job: Partial<Vacancy>, userId: string): Promise<string> {
  const jobId = job.id || `job-${Date.now()}`;
  const now = new Date().toISOString();

  const record: Vacancy = {
    id: jobId,
    title: job.title || 'Vakansiya',
    department: job.department || '',
    category: job.category || 'İT və Proqramlaşdırma',
    companyId: job.companyId || '',
    companyName: job.companyName || '',
    companyLogo: job.companyLogo || '',
    companyVerified: job.companyVerified ?? false,
    city: job.city || 'Bakı',
    location: job.location || job.city || 'Bakı',
    workplaceType: job.workplaceType || 'on-site',
    employmentType: job.employmentType || 'Tam ştat',
    experienceLevel: job.experienceLevel || 'Orta (Mid-level, 1-3 il)',
    education: job.education || 'Ali',
    minSalary: job.minSalary,
    maxSalary: job.maxSalary,
    currency: job.currency || 'AZN',
    hideSalary: job.hideSalary ?? false,
    description: job.description || '',
    responsibilities: job.responsibilities || [],
    requirements: job.requirements || [],
    benefits: job.benefits || [],
    skills: job.skills || [],
    postedDate: job.postedDate || now.split('T')[0],
    deadline: job.deadline || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    status: job.status || 'pending_review',
    isApproved: job.isApproved ?? false,
    isFeatured: job.isFeatured ?? false,
    viewsCount: job.viewsCount || 0,
    applicantsCount: job.applicantsCount || 0,
    contactPhone: job.contactPhone || '',
    contactWhatsapp: job.contactWhatsapp || '',
    isBlueCollarFriendly: job.isBlueCollarFriendly ?? false,
    createdBy: userId,
    createdAt: job.createdAt || now,
    updatedAt: now,
  };

  await setDoc(doc(db, 'jobs', jobId), record);
  return jobId;
}

/**
 * Update vacancy status (e.g. approve, reject, close, publish)
 */
export async function updateVacancyStatus(jobId: string, status: Vacancy['status'], isApproved?: boolean) {
  const updates: Record<string, any> = { status, updatedAt: new Date().toISOString() };
  if (isApproved !== undefined) updates.isApproved = isApproved;
  await updateDoc(doc(db, 'jobs', jobId), updates);
}

/**
 * Increment job view count
 */
export async function incrementJobViews(jobId: string) {
  try {
    await updateDoc(doc(db, 'jobs', jobId), {
      viewsCount: increment(1),
    });
  } catch {}
}

/* ========================================================================= */
/* 2. REAL COMPANIES FIRESTORE SERVICE                                       */
/* ========================================================================= */

/**
 * Get all verified companies for public directory
 */
export async function getVerifiedCompanies(): Promise<Company[]> {
  try {
    const q = query(
      collection(db, 'companies'),
      where('verificationStatus', '==', 'verified')
    );
    const snap = await getDocs(q);
    const list: Company[] = [];
    snap.forEach((d) => {
      list.push({ ...d.data(), id: d.id } as Company);
    });
    return list;
  } catch (err) {
    console.error('Error fetching verified companies:', err);
    return [];
  }
}

/**
 * Get company by ID
 */
export async function getCompanyById(companyId: string): Promise<Company | null> {
  try {
    const snap = await getDoc(doc(db, 'companies', companyId));
    if (snap.exists()) {
      return { ...snap.data(), id: snap.id } as Company;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Update company profile
 */
export async function updateCompanyProfile(companyId: string, data: Partial<Company>) {
  await updateDoc(doc(db, 'companies', companyId), {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Admin: Verify or change company status
 */
export async function setCompanyVerificationStatus(
  companyId: string, 
  status: 'pending' | 'verified' | 'rejected' | 'suspended'
) {
  await updateDoc(doc(db, 'companies', companyId), {
    verificationStatus: status,
    verified: status === 'verified',
    updatedAt: new Date().toISOString(),
  });
}

/* ========================================================================= */
/* 3. REAL CANDIDATE PROFILES & CVs                                          */
/* ========================================================================= */

/**
 * Get candidate profile
 */
export async function getCandidateProfile(userId: string): Promise<CandidateProfile | null> {
  try {
    const snap = await getDoc(doc(db, 'candidateProfiles', userId));
    if (snap.exists()) {
      return snap.data() as CandidateProfile;
    }
    return null;
  } catch (err) {
    console.error('Error fetching candidate profile:', err);
    return null;
  }
}

/**
 * Save candidate profile
 */
export async function saveCandidateProfile(userId: string, data: Partial<CandidateProfile>) {
  const now = new Date().toISOString();
  const ref = doc(db, 'candidateProfiles', userId);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    await updateDoc(ref, {
      ...data,
      updatedAt: now,
    });
  } else {
    await setDoc(ref, {
      ...data,
      id: userId,
      userId: userId,
      createdAt: now,
      updatedAt: now,
    });
  }
}

/* ========================================================================= */
/* 4. REAL APPLICATIONS FIRESTORE SERVICE                                    */
/* ========================================================================= */

/**
 * Check if candidate already applied to this job
 */
export async function hasCandidateApplied(candidateId: string, jobId: string): Promise<boolean> {
  try {
    const q = query(
      collection(db, 'applications'),
      where('candidateId', '==', candidateId),
      where('jobId', '==', jobId)
    );
    const snap = await getDocs(q);
    return !snap.empty;
  } catch {
    return false;
  }
}

/**
 * Submit real application to a vacancy
 */
export async function submitJobApplication(
  job: Vacancy,
  candidate: User,
  candidateProfile: CandidateProfile | null,
  coverNote?: string
): Promise<Application> {
  const appId = `app-${Date.now()}`;
  const now = new Date().toISOString();

  // Check duplicate
  const alreadyApplied = await hasCandidateApplied(candidate.id, job.id);
  if (alreadyApplied) {
    throw new Error('Siz artıq bu vakansiyaya müraciət etmisiniz.');
  }

  const newApp: Application = {
    id: appId,
    jobId: job.id,
    vacancyId: job.id,
    vacancyTitle: job.title,
    companyId: job.companyId,
    companyName: job.companyName,
    companyLogo: job.companyLogo,
    candidateId: candidate.id,
    candidateName: candidate.fullName,
    candidateEmail: candidate.email,
    candidatePhone: candidate.phone || '',
    candidatePhoto: candidate.avatarUrl || candidateProfile?.profilePhoto,
    appliedDate: now.split('T')[0],
    status: 'Müraciət edildi',
    coverNote: coverNote || '',
    cvUrl: candidateProfile?.cvUrl,
    cvData: {
      id: `cv-${candidate.id}`,
      title: `${candidate.fullName} - CV`,
      lastUpdated: now,
      personalInfo: {
        fullName: candidate.fullName,
        jobTitle: candidateProfile?.professionalTitle || 'Namizəd',
        email: candidate.email,
        phone: candidate.phone || '',
        address: candidateProfile?.location || 'Bakı',
        summary: candidateProfile?.about || '',
        photoUrl: candidate.avatarUrl,
      },
      experiences: candidateProfile?.workExperience || [],
      education: candidateProfile?.education || [],
      skills: (candidateProfile?.skills || []).map((s, idx) => ({
        id: `s-${idx}`,
        name: s,
        level: 'Yaxşı',
        category: 'Texniki',
      })),
      languages: candidateProfile?.languages || [],
      projects: [],
      certificates: candidateProfile?.certifications || [],
    },
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(doc(db, 'applications', appId), newApp);

  // Increment applicants count on job
  await updateDoc(doc(db, 'jobs', job.id), {
    applicantsCount: increment(1),
  }).catch(() => {});

  // Create real notification for employer
  await createNotification({
    userId: job.createdBy || job.companyId,
    title: 'Yeni Namizəd Müraciəti!',
    message: `${candidate.fullName} "${job.title}" vakansiyasına müraciət etdi.`,
    type: 'new_applicant',
    link: `/employer/applications`,
  });

  return newApp;
}

/**
 * Get candidate's own applications
 */
export async function getCandidateApplications(candidateId: string): Promise<Application[]> {
  try {
    const q = query(
      collection(db, 'applications'),
      where('candidateId', '==', candidateId)
    );
    const snap = await getDocs(q);
    const list: Application[] = [];
    snap.forEach((d) => {
      list.push({ ...d.data(), id: d.id } as Application);
    });
    return list;
  } catch (err) {
    console.error('Error fetching candidate applications:', err);
    return [];
  }
}

/**
 * Get employer's company applications
 */
export async function getCompanyApplications(companyId: string): Promise<Application[]> {
  try {
    const q = query(
      collection(db, 'applications'),
      where('companyId', '==', companyId)
    );
    const snap = await getDocs(q);
    const list: Application[] = [];
    snap.forEach((d) => {
      list.push({ ...d.data(), id: d.id } as Application);
    });
    return list;
  } catch (err) {
    console.error('Error fetching company applications:', err);
    return [];
  }
}

/**
 * Update application status (Employer / Admin)
 */
export async function updateApplicationStatus(
  applicationId: string, 
  status: Application['status'], 
  recruiterNotes?: string
) {
  const updates: Record<string, any> = {
    status,
    updatedAt: new Date().toISOString(),
  };
  if (recruiterNotes !== undefined) updates.recruiterNotes = recruiterNotes;

  await updateDoc(doc(db, 'applications', applicationId), updates);

  // Notify candidate
  const snap = await getDoc(doc(db, 'applications', applicationId));
  if (snap.exists()) {
    const appData = snap.data() as Application;
    if (appData.candidateId) {
      await createNotification({
        userId: appData.candidateId,
        title: 'Müraciət Statusu Yeniləndi',
        message: `"${appData.vacancyTitle}" vakansiyası üzrə müraciətinizin yeni statusu: ${status}`,
        type: 'status_changed',
        link: '/candidate/applications',
      });
    }
  }
}

/* ========================================================================= */
/* 5. REAL NOTIFICATIONS FIRESTORE SERVICE                                   */
/* ========================================================================= */

/**
 * Create a real notification
 */
export async function createNotification(data: {
  userId: string;
  title: string;
  message: string;
  type: AppNotification['type'];
  link?: string;
  data?: Record<string, any>;
}): Promise<string> {
  const notifId = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const notif: AppNotification = {
    id: notifId,
    userId: data.userId,
    title: data.title,
    message: data.message,
    type: data.type,
    isRead: false,
    link: data.link,
    data: data.data,
    createdAt: new Date().toISOString(),
  };
  await setDoc(doc(db, 'notifications', notifId), notif);
  return notifId;
}

/**
 * Realtime subscribe to user notifications
 */
export function subscribeToUserNotifications(
  userId: string, 
  callback: (notifications: AppNotification[]) => void
) {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId)
  );
  return onSnapshot(q, (snap) => {
    const list: AppNotification[] = [];
    snap.forEach((d) => {
      list.push({ ...d.data(), id: d.id } as AppNotification);
    });
    // Sort descending by date
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(list);
  }, (err) => {
    console.error('Notification snapshot error:', err);
    callback([]);
  });
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notifId: string) {
  await updateDoc(doc(db, 'notifications', notifId), { isRead: true });
}

/* ========================================================================= */
/* 6. REAL JOB OFFERS FIRESTORE SERVICE                                      */
/* ========================================================================= */

/**
 * Create Job Offer
 */
export async function createJobOfferInFirestore(offer: Partial<JobOffer>): Promise<string> {
  const offerId = offer.id || `offer-${Date.now()}`;
  const now = new Date().toISOString();

  const record: JobOffer = {
    id: offerId,
    candidateId: offer.candidateId || '',
    candidateName: offer.candidateName || '',
    candidateEmail: offer.candidateEmail || '',
    candidatePhone: offer.candidatePhone || '',
    companyId: offer.companyId || '',
    companyName: offer.companyName || '',
    companyLogo: offer.companyLogo || '',
    companyAddress: offer.companyAddress || 'Bakı, Azərbaycan',
    companyEmail: offer.companyEmail || '',
    companyPhone: offer.companyPhone || '',
    hrContactPerson: offer.hrContactPerson || '',
    hrContactPosition: offer.hrContactPosition || '',
    position: offer.position || 'Mütəxəssis',
    department: offer.department || 'Əsas',
    employmentType: offer.employmentType || 'Full-time',
    workLocation: offer.workLocation || 'Bakı',
    startDate: offer.startDate || now.split('T')[0],
    grossSalary: offer.grossSalary || 0,
    netSalary: offer.netSalary || 0,
    probationPeriod: offer.probationPeriod || '3 months',
    workingSchedule: offer.workingSchedule || '09:00 - 18:00 (B.e. - Cümə)',
    annualLeave: offer.annualLeave || '21 təqvim günü',
    bonus: offer.bonus || 'İllik KPI əsaslı',
    benefits: offer.benefits || [],
    additionalTerms: offer.additionalTerms || '',
    templateId: offer.templateId || 'default-az',
    language: offer.language || 'az',
    status: offer.status || 'SENT',
    secureToken: offer.secureToken || `token-${Date.now()}`,
    createdBy: offer.createdBy || '',
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(doc(db, 'jobOffers', offerId), record);

  // Notify candidate
  if (record.candidateId) {
    await createNotification({
      userId: record.candidateId,
      title: '🎉 Rəsmi İş Təklifi Aldınız!',
      message: `${record.companyName} şirkəti sizə "${record.position}" vəzifəsi üzrə rəsmi iş təklifi təqdim etdi.`,
      type: 'job_offer',
      link: '/candidate/offers',
    });
  }

  return offerId;
}

/**
 * Candidate responds to Job Offer (Accept / Decline)
 */
export async function respondToJobOffer(
  offerId: string, 
  status: 'ACCEPTED' | 'DECLINED',
  reason?: { category: any; text?: string }
) {
  const now = new Date().toISOString();
  const updates: Record<string, any> = {
    status,
    updatedAt: now,
  };
  if (status === 'ACCEPTED') updates.acceptedAt = now;
  if (status === 'DECLINED') {
    updates.declinedAt = now;
    if (reason) updates.declineReason = reason;
  }

  await updateDoc(doc(db, 'jobOffers', offerId), updates);
}

/* ========================================================================= */
/* 7. REAL SAVED JOBS (BOOKMARKS)                                            */
/* ========================================================================= */

export async function toggleSaveJobInFirestore(userId: string, jobId: string): Promise<boolean> {
  const docId = `${userId}_${jobId}`;
  const ref = doc(db, 'savedJobs', docId);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    await deleteDoc(ref);
    return false; // removed
  } else {
    await setDoc(ref, {
      id: docId,
      userId,
      jobId,
      savedAt: new Date().toISOString(),
    });
    return true; // saved
  }
}

export async function getSavedJobIds(userId: string): Promise<string[]> {
  try {
    const q = query(
      collection(db, 'savedJobs'),
      where('userId', '==', userId)
    );
    const snap = await getDocs(q);
    const ids: string[] = [];
    snap.forEach((d) => {
      ids.push(d.data().jobId);
    });
    return ids;
  } catch {
    return [];
  }
}

/* ========================================================================= */
/* 8. ADMIN REALTIME METRICS FROM FIRESTORE                                  */
/* ========================================================================= */

export async function getAdminPlatformMetrics() {
  const [usersSnap, companiesSnap, jobsSnap, appsSnap, offersSnap] = await Promise.all([
    getDocs(collection(db, 'users')),
    getDocs(collection(db, 'companies')),
    getDocs(collection(db, 'jobs')),
    getDocs(collection(db, 'applications')),
    getDocs(collection(db, 'jobOffers')),
  ]);

  let totalHires = 0;
  offersSnap.forEach((d) => {
    if (d.data().status === 'ACCEPTED') totalHires++;
  });

  return {
    totalUsers: usersSnap.size,
    totalCompanies: companiesSnap.size,
    totalVacancies: jobsSnap.size,
    totalApplications: appsSnap.size,
    totalHires: totalHires,
  };
}
