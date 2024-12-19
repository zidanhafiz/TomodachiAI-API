import { ZodError } from "zod";

export const formatZodError = (error: ZodError) => {
  const errors = error.issues.map((issue) => ({
    path: issue.path[issue.path.length - 1],
    message: issue.message,
  }));

  return errors;
};
