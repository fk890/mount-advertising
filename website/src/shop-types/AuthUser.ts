export interface AuthUser {
  userId: string;
  email: string;
  role: 'admin' | 'user';
}
