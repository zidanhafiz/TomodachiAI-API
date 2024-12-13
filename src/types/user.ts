export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  password?: string;
  refreshToken: string;
  createdAt?: Date;
  updatedAt?: Date;
};
