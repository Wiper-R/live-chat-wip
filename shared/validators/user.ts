import { z } from "zod";
export const CreateUserRequest = z.object({
  email: z.string().email(),
  sub: z.string(),
  // More fields exists, but we currently only worry about these
});

export type CreateUserRequest = z.infer<typeof CreateUserRequest>;
