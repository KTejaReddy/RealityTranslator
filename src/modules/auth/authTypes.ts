export type AuthRole = 'user' | 'government';

export type AuthSession = {
  id: string;
  role: AuthRole;
  email: string;
};

export type AuthLoginInput = {
  email: string;
  password: string;
};

