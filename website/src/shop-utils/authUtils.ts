import { ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers';
import { cookies } from 'next/headers';
import { verifyToken } from '../services/authService';
import { getUserById } from '../services/userService';
import { AuthUser } from '@/shop-types/AuthUser';

/**
 * Check if the user is authenticated based on request headers
 * In a real app, this would verify JWT tokens or session cookies
 */
export async function isAuthenticated(headers: Headers | ReadonlyHeaders | Promise<ReadonlyHeaders>): Promise<AuthUser | null> {
  // Wait for the headers if it's a promise
  const resolvedHeaders = headers instanceof Promise ? await headers : headers;
  const token = resolvedHeaders.get('Authorization')?.replace('Bearer ', '');

  if (!token) return null;

  try {
    const user = await verifyToken(token);
    return user;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

/**
 * Check if the user is an admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const user = await getUserById(userId);
  return user?.role === 'admin';
}

/**
 * Get the current user from cookies or session
 */
export function getCurrentUser(): AuthUser | null {
  const tokenCookie = cookies().get('authToken');
  if (!tokenCookie || !tokenCookie.value) return null;

  try {
    return verifyToken(tokenCookie.value);
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Check if a route requires authentication
 */
export function requiresAuth(pathname: string): boolean {
  return pathname.startsWith('/admin') || 
         pathname.startsWith('/account') ||
         pathname.startsWith('/orders');
}

/**
 * Check if a route requires admin privileges
 */
export function requiresAdmin(pathname: string): boolean {
  return pathname.startsWith('/admin');
}
