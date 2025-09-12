import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';

export interface IUser extends DefaultUser {
  id: string;
  username: string;
  role: string;
}

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: string;
    } & DefaultSession['user'];
  }

  interface User extends IUser {}
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
  }
}
