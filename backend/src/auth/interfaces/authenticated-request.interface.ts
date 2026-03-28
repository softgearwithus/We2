import { Request } from 'express';
import { UserRole } from '../../users/user.entity';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  collegeId: string | null;
  department: string | null;
  year: string | null;
  sessionVersion: number;
  userId?: string; // For backward compatibility with some controllers
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
