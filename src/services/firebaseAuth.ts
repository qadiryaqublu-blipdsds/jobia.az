import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendEmailVerification, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser,
  reload
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { User, AuthSession, UserRole } from '../types';

const ADMIN_EMAIL = 'admin@jobia.az';

/**
 * Maps a Firebase user and Firestore document to the platform User interface.
 */
export async function fetchUserProfile(fbUser: FirebaseUser): Promise<User | null> {
  const userDocRef = doc(db, 'users', fbUser.uid);
  const snap = await getDoc(userDocRef);

  if (!snap.exists()) {
    // If admin signs in without document, auto-provision admin record
    if (fbUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      const adminUser: User = {
        id: fbUser.uid,
        email: fbUser.email,
        role: 'admin',
        fullName: fbUser.displayName || 'Sistem Administratoru',
        status: 'active',
        emailVerified: fbUser.emailVerified,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
      await setDoc(userDocRef, adminUser);
      return adminUser;
    }
    return null;
  }

  const data = snap.data() as User;
  return {
    ...data,
    id: fbUser.uid,
    email: fbUser.email || data.email,
    emailVerified: fbUser.emailVerified,
  };
}

/**
 * 1. Register Candidate with real Firebase Auth and email verification
 */
export async function registerCandidateWithFirebase(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}): Promise<{ user: User; needsEmailVerification: boolean }> {
  const email = data.email.trim().toLowerCase();
  const fullName = `${data.firstName.trim()} ${data.lastName.trim()}`;

  // 1. Create User in Firebase Auth
  const userCredential = await createUserWithEmailAndPassword(auth, email, data.password);
  const fbUser = userCredential.user;

  // 2. Send Real Email Verification
  await sendEmailVerification(fbUser);

  // 3. Create User Document in Cloud Firestore
  const newUser: User = {
    id: fbUser.uid,
    email: email,
    role: 'candidate',
    fullName: fullName,
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    phone: data.phone.trim(),
    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
    status: 'active',
    emailVerified: false,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  await setDoc(doc(db, 'users', fbUser.uid), newUser);

  // 4. Create empty CandidateProfile in Firestore
  await setDoc(doc(db, 'candidateProfiles', fbUser.uid), {
    id: fbUser.uid,
    userId: fbUser.uid,
    fullName: fullName,
    professionalTitle: 'Karyera Axtarışında',
    about: '',
    phone: data.phone.trim(),
    email: email,
    location: 'Bakı, Azərbaycan',
    skills: [],
    languages: [{ id: 'lang-1', language: 'Azərbaycan dili', proficiency: 'Ana dili' }],
    education: [],
    workExperience: [],
    certifications: [],
    profileVisibility: 'public',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  return { user: newUser, needsEmailVerification: true };
}

/**
 * 2. Register Employer with real Firebase Auth, email verification & Company creation
 */
export async function registerEmployerWithFirebase(data: {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  password: string;
  description?: string;
}): Promise<{ user: User; needsEmailVerification: boolean }> {
  const email = data.email.trim().toLowerCase();
  const companyName = data.companyName.trim();
  const contactName = data.contactName.trim();

  // 1. Create Auth user
  const userCredential = await createUserWithEmailAndPassword(auth, email, data.password);
  const fbUser = userCredential.user;

  // 2. Send Real Email Verification
  await sendEmailVerification(fbUser);

  const companyId = `comp-${Date.now()}`;

  // 3. Create Company in Firestore with status 'pending' (requires admin verification)
  await setDoc(doc(db, 'companies', companyId), {
    id: companyId,
    name: companyName,
    logo: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(companyName)}`,
    verified: false,
    verificationStatus: 'pending',
    industry: 'İnformasiya Texnologiyaları',
    location: 'Bakı, Azərbaycan',
    email: email,
    phone: data.phone.trim(),
    hrContactName: contactName,
    description: data.description?.trim() || `${companyName} rəsmi işəgötürən profili.`,
    employeeCount: '1-10',
    activeJobsCount: 0,
    createdBy: fbUser.uid,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // 4. Create User document in Firestore
  const newUser: User = {
    id: fbUser.uid,
    email: email,
    role: 'business',
    fullName: contactName,
    phone: data.phone.trim(),
    companyId: companyId,
    companyName: companyName,
    companyDescription: data.description?.trim() || '',
    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(companyName)}`,
    status: 'active',
    emailVerified: false,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  await setDoc(doc(db, 'users', fbUser.uid), newUser);

  return { user: newUser, needsEmailVerification: true };
}

/**
 * 3. User Login with strict email verification check
 */
export async function loginWithFirebase(
  email: string, 
  pass: string
): Promise<{ user: User; session: AuthSession; isVerified: boolean }> {
  const normalizedEmail = email.trim().toLowerCase();
  const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, pass);
  const fbUser = userCredential.user;

  // Refresh auth state to get latest emailVerified status
  await reload(fbUser);

  // Fetch or create user record
  let user = await fetchUserProfile(fbUser);
  if (!user) {
    throw new Error('İstifadəçi profil məlumatı tapılmadı.');
  }

  if (user.status === 'suspended') {
    await signOut(auth);
    throw new Error('Hesabınız inzibatçı tərəfindən dayandırılıb. Dəstək xidməti ilə əlaqə saxlayın.');
  }

  // Update last login
  await updateDoc(doc(db, 'users', fbUser.uid), {
    lastLoginAt: new Date().toISOString(),
    emailVerified: fbUser.emailVerified,
  }).catch(() => {});

  const token = await fbUser.getIdToken();
  const session: AuthSession = {
    token,
    user: { ...user, emailVerified: fbUser.emailVerified },
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };

  return {
    user: session.user,
    session,
    isVerified: fbUser.emailVerified || user.role === 'admin',
  };
}

/**
 * 4. Resend verification email
 */
export async function resendVerificationEmail(): Promise<void> {
  const current = auth.currentUser;
  if (!current) {
    throw new Error('Daxil olmuş istifadəçi tapılmadı. Yenidən giriş edin.');
  }
  await sendEmailVerification(current);
}

/**
 * 5. Check current user email verification status
 */
export async function checkEmailVerified(): Promise<boolean> {
  const current = auth.currentUser;
  if (!current) return false;
  await reload(current);
  return current.emailVerified;
}

/**
 * 6. Send Password Reset Email
 */
export async function requestPasswordResetFirebase(email: string): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  await sendPasswordResetEmail(auth, normalizedEmail);
}

/**
 * 7. Logout
 */
export async function logoutFirebase(): Promise<void> {
  await signOut(auth);
}

/**
 * 8. Subscribe to auth changes
 */
export function onAuthUserChanged(callback: (user: User | null, fbUser: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, async (fbUser) => {
    if (!fbUser) {
      callback(null, null);
      return;
    }
    const profile = await fetchUserProfile(fbUser);
    callback(profile, fbUser);
  });
}
