export type Agent = {
  id: string;
  name: string;
  language: string;
  avatar?: string;
  personality?: string[];
  status?: "IDLE" | "PROCESSING" | "ERROR";
  role?: "ASSISTANT" | "FRIEND" | "GIRLFRIEND" | "BOYFRIEND" | "HUSBAND" | "WIFE";
  prompt?: string;
  createdAt?: Date;
  updatedAt?: Date;
  userId: string;
};
