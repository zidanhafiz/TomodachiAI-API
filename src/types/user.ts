export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "ADMIN" | "USER";
  password?: string;
  refreshToken: string;
  credits: number;
  createdAt?: Date;
  updatedAt?: Date;
};
