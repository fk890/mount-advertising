import { AuthUser } from '@/shop-types/AuthUser';

// Mock user store - in production, this would be a database
const mockUsers: Map<string, AuthUser & { name?: string }> = new Map();

/**
 * Get a user by their ID
 */
export async function getUserById(userId: string): Promise<(AuthUser & { name?: string }) | null> {
  // In production, this would query a database
  const user = mockUsers.get(userId);
  if (user) return user;
  
  // Return a mock user for demo purposes
  return {
    userId,
    email: `user-${userId}@example.com`,
    role: 'user',
    name: 'Demo User',
  };
}

/**
 * Get a user by their email
 */
export async function getUserByEmail(email: string): Promise<(AuthUser & { name?: string }) | null> {
  // In production, this would query a database
  for (const user of mockUsers.values()) {
    if (user.email === email) return user;
  }
  return null;
}

/**
 * Create a new user
 */
export async function createUser(userData: {
  email: string;
  name?: string;
  role?: 'admin' | 'user';
}): Promise<AuthUser & { name?: string }> {
  const userId = 'user-' + Date.now();
  const user: AuthUser & { name?: string } = {
    userId,
    email: userData.email,
    role: userData.role || 'user',
    name: userData.name,
  };
  
  mockUsers.set(userId, user);
  return user;
}

/**
 * Update a user's information
 */
export async function updateUser(
  userId: string,
  updates: Partial<{ email: string; name: string; role: 'admin' | 'user' }>
): Promise<(AuthUser & { name?: string }) | null> {
  const user = mockUsers.get(userId);
  if (!user) return null;
  
  const updatedUser = { ...user, ...updates };
  mockUsers.set(userId, updatedUser);
  return updatedUser;
}

/**
 * Delete a user
 */
export async function deleteUser(userId: string): Promise<boolean> {
  return mockUsers.delete(userId);
}
