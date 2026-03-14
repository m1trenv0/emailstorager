import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const fallbackDatabaseUrl =
  process.env.DATABASE_URL ?? 'mongodb://127.0.0.1:27017/emailstorager';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  engine: 'classic',
  datasource: {
    url: fallbackDatabaseUrl,
  },
});
