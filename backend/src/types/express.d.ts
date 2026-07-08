import type { Role } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        email: string;
      };
      membership?: {
        id: string;
        groupId: string;
        role: Role;
      };
    }
  }
}

export {};
