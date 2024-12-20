import { z } from "zod";
export const CreateUserRequest = z.object({
  email: z.string().email(),
  sub: z.string(),
  // More fields exists, but we currently only worry about these
});

export type CreateUserRequest = z.infer<typeof CreateUserRequest>;

export const SearchUsers = z.object({
  q: z.string(),
});

export const FinalizeSignUp = z.object({
  username: z.string(),
  name: z.string(),
});
