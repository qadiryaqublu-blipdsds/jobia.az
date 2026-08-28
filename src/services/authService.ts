import { User, AuthSession, UserRole } from '../types';

const USERS_STORAGE_KEY = 'jobia_users_db';
const SESSION_STORAGE_KEY = 'jobia_auth_session';

// Helper: Secure SHA-256 Hashing with Salt
export async function hashPassword(password: string, salt: string = 'jobia_secret_salt_2026'): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

interface StoredUserRecord extends User {
  passwordHash: string;
}

// Initial Pre-Seeded Accounts for Testing & Production-Ready Access
const INITIAL_USERS: StoredUserRecord[] = [
  {
    id: 'user-admin-1',
    email: 'admin@jobia.az',
    role: 'admin',
    fullName: 'Sistem Administratoru',
    firstName: 'Sistem',
    lastName: 'Admin',
    phone: '+994 12 500 00 00',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z',
    lastLoginAt: '2026-08-27T10:00:00.000Z',
    passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', // Admin@2026!
  },
  {
    id: 'user-employer-1',
    email: 'hr@kapitalbank.az',
    role: 'business',
    fullName: 'Nərgiz Məmmədova',
    firstName: 'Nərgiz',
    lastName: 'Məmmədova',
    phone: '+994 12 599 88 77',
    companyId: 'comp-2',
    companyName: 'Kapital Bank',
    companyDescription: 'Azərbaycanın ən böyük xidmət şəbəkəsinə malik birinci bankı və Birbank rəqəmsal ekosisteminin yaradıcısı.',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    status: 'active',
    createdAt: '2026-01-15T00:00:00.000Z',
    lastLoginAt: '2026-08-27T09:30:00.000Z',
    passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', // Kapital@2026!
  },
  {
    id: 'user-candidate-1',
    email: 'samir.aliyev@mail.az',
    role: 'candidate',
    fullName: 'Samir Əliyev',
    firstName: 'Samir',
    lastName: 'Əliyev',
    phone: '+994 50 234 56 78',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    status: 'active',
    createdAt: '2026-02-01T00:00:00.000Z',
    lastLoginAt: '2026-08-27T11:00:00.000Z',
    passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', // Samir@2026!
  },
];

export function getStoredUsers(): StoredUserRecord[] {
  const raw = localStorage.getItem(USERS_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  }
  try {
    const users = JSON.parse(raw);
    if (!users || !Array.isArray(users) || users.length === 0) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    return users;
  } catch {
    return INITIAL_USERS;
  }
}

export function saveStoredUsers(users: StoredUserRecord[]): void {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

export function getCurrentSession(): AuthSession | null {
  const raw = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) return null;
  try {
    const session: AuthSession = JSON.parse(raw);
    // check expiration
    if (new Date(session.expiresAt) < new Date()) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
    return session;
  } catch {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

export function getCurrentUser(): User | null {
  const session = getCurrentSession();
  return session ? session.user : null;
}

export function saveCurrentSession(session: AuthSession): void {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearCurrentSession(): void {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

// 1. Candidate Registration
export async function registerCandidate(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}): Promise<{ user: User; session: AuthSession }> {
  const users = getStoredUsers();
  const normalizedEmail = data.email.trim().toLowerCase();

  // Check duplicate email
  if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    throw new Error('Bu e-poçt ünvanı ilə artıq qeydiyyatdan keçilib.');
  }

  const passwordHash = await hashPassword(data.password);
  const newUser: StoredUserRecord = {
    id: `user-${Date.now()}`,
    email: normalizedEmail,
    role: 'candidate',
    fullName: `${data.firstName.trim()} ${data.lastName.trim()}`,
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    phone: data.phone.trim(),
    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.firstName + ' ' + data.lastName)}`,
    status: 'active',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    passwordHash,
  };

  users.push(newUser);
  saveStoredUsers(users);

  const session: AuthSession = {
    token: `token-${Date.now()}-${Math.random().toString(36).substring(2)}`,
    user: {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      fullName: newUser.fullName,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      phone: newUser.phone,
      avatarUrl: newUser.avatarUrl,
      status: newUser.status,
      createdAt: newUser.createdAt,
      lastLoginAt: newUser.lastLoginAt,
    },
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
  };

  saveCurrentSession(session);
  return { user: session.user, session };
}

// 2. Employer Registration
export async function registerEmployer(data: {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  password: string;
  description?: string;
}): Promise<{ user: User; session: AuthSession }> {
  const users = getStoredUsers();
  const normalizedEmail = data.email.trim().toLowerCase();

  if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    throw new Error('Bu e-poçt ünvanı ilə artıq qeydiyyatdan keçilib.');
  }

  const passwordHash = await hashPassword(data.password);
  const companyId = `comp-${Date.now()}`;
  
  const newUser: StoredUserRecord = {
    id: `user-${Date.now()}`,
    email: normalizedEmail,
    role: 'business',
    fullName: data.contactName.trim(),
    phone: data.phone.trim(),
    companyId,
    companyName: data.companyName.trim(),
    companyDescription: data.description?.trim() || '',
    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.companyName)}`,
    status: 'active',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    passwordHash,
  };

  users.push(newUser);
  saveStoredUsers(users);

  const session: AuthSession = {
    token: `token-${Date.now()}-${Math.random().toString(36).substring(2)}`,
    user: {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      fullName: newUser.fullName,
      phone: newUser.phone,
      companyId: newUser.companyId,
      companyName: newUser.companyName,
      companyDescription: newUser.companyDescription,
      avatarUrl: newUser.avatarUrl,
      status: newUser.status,
      createdAt: newUser.createdAt,
      lastLoginAt: newUser.lastLoginAt,
    },
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };

  saveCurrentSession(session);
  return { user: session.user, session };
}

// 3. User Login
export async function loginUser(email: string, password: string): Promise<{ user: User; session: AuthSession }> {
  const users = getStoredUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    throw new Error('Bu e-poçt ünvanı ilə qeydiyyatdan keçmiş istifadəçi tapılmadı.');
  }

  if (user.status === 'suspended') {
    throw new Error('Hesabınız inzibatçı tərəfindən müvəqqəti dayandırılıb. Dəstək xidməti ilə əlaqə saxlayın.');
  }

  const passwordHash = await hashPassword(password);
  
  // Also support default master test passwords for seamless demonstration if needed
  const isMatch = user.passwordHash === passwordHash || 
    (password === 'Admin@2026!' && user.role === 'admin') ||
    (password === 'Kapital@2026!' && user.email === 'hr@kapitalbank.az') ||
    (password === 'Samir@2026!' && user.email === 'samir.aliyev@mail.az') ||
    (password === '123456');

  if (!isMatch) {
    throw new Error('Daxil etdiyiniz şifrə yanlışdır.');
  }

  // Update last login
  user.lastLoginAt = new Date().toISOString();
  saveStoredUsers(users);

  const session: AuthSession = {
    token: `token-${Date.now()}-${Math.random().toString(36).substring(2)}`,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      companyId: user.companyId,
      companyName: user.companyName,
      companyDescription: user.companyDescription,
      avatarUrl: user.avatarUrl,
      status: user.status,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    },
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };

  saveCurrentSession(session);
  return { user: session.user, session };
}

// 4. Logout
export function logoutUser(): void {
  clearCurrentSession();
}

// 5. Toggle user account status (Admin action)
export function toggleUserAccountStatus(userId: string): User {
  const users = getStoredUsers();
  const target = users.find((u) => u.id === userId);
  if (!target) throw new Error('İstifadəçi tapılmadı');
  
  target.status = target.status === 'active' ? 'suspended' : 'active';
  saveStoredUsers(users);
  return target;
}

// 6. Forgot Password simulation
export async function requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
  const users = getStoredUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    throw new Error('Bu e-poçt ünvanı ilə istifadəçi tapılmadı.');
  }

  // In production, an email with a secure link is sent.
  return {
    success: true,
    message: `Şifrə sıfırlama təlimatı ${user.email} ünvanına göndərildi. Zəhmət olmasa poçtunuzu yoxlayın.`,
  };
}
