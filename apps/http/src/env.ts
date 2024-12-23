import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  SERVER_PORT: z.coerce.number(),
});

const env = envSchema.parse(process.env);
export default env;
