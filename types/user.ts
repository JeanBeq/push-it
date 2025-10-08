/**
 * Types liés aux utilisateurs
 * Basé sur les spécifications du projet Push-It
 */

export type UserRole = 'admin' | 'user';

export interface User {
  id: number;
  googleId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profilePictureUrl: string | null;
  role: UserRole;
  createdAt: string;
  lastLoginAt: string;
}

export interface CreateUserDTO {
  googleId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profilePictureUrl: string | null;
  role?: UserRole;
}

export interface UpdateUserDTO {
  firstName?: string | null;
  lastName?: string | null;
  profilePictureUrl?: string | null;
  role?: UserRole;
  lastLoginAt?: string;
}

