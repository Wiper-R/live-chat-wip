import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().optional(),
  AUDIENCE: z.string().url(),
  ISSUER_BASE_URL: z.string().url(),
  AUTH0_CLIENT_SECRET: z.string(),
});

const env = envSchema.parse(process.env);
export default env;
