import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().optional(),
  AUDIENCE: z.string().url(),
  ISSUER_BASE_URL: z.string().url(),
});

const env = envSchema.parse(process.env);
export default env;
