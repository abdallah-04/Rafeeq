
export enum UserRole {
  PARENT = 'parent',
  TEACHER = 'teacher',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  name: string;
  email?: string;
  phone: string;
  role: UserRole;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ParentUser extends User {
  role: UserRole.PARENT;
  children: string[]; 
}

export interface TeacherUser extends User {
  role: UserRole.TEACHER;
  schoolId: string;
  schoolName: string;
  advisorName?: string;
  advisorId?: string;
  students: string[]; 
}

export interface AdminUser extends User {
  role: UserRole.ADMIN;
  schoolId: string;
  schoolName: string;
  teachers: string[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  phone: string;
  password: string;
  role: UserRole;
}

export interface SignUpData {
  name: string;
  phone: string;
  password: string;
  confirmPassword: string;
  schoolId?: string;
  schoolName?: string;
  advisorName?: string;
  advisorId?: string;
}

export interface VerificationData {
  phone: string;
  code: string;
}

export interface ResetPasswordData {
  phone: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
}