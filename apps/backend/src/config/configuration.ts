export default () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  databaseUrl: process.env.DATABASE_URL,
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'fallback-access-secret-key-12345',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-key-67890',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@school.com',
    password: process.env.ADMIN_PASSWORD || 'AdminSecret123!',
  },
  school: {
    name: process.env.SCHOOL_NAME || 'Greenwood High School',
    code: process.env.SCHOOL_CODE || 'GHS001',
  },
});
