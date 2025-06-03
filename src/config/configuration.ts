export const configuration = () => ({
  environment: process.env.NODE_ENV,
  apiHost: process.env.API_HOST || '127.0.0.1',
  apiPort: parseInt(process.env.API_PORT || '3001', 10),
  dbHost: process.env.DB_HOST || '127.0.0.1',
  dbPort: parseInt(process.env.DB_PORT || '5432', 10),
  dbUser: process.env.DB_USER || 'postgres',
  dbPassword: process.env.DB_PASSWORD || 'password',
  dbName: process.env.DB_NAME || 'jtk_db',

  jwtPrivateKey: process.env.JWT_PRIVATE_KEY,
  jwtPublicKey: process.env.JWT_PUBLIC_KEY,

  jwtExpiry: process.env.JWT_EXPIRY,
  jwtRefreshExpiry: process.env.JWT_REFRESH_EXPIRY,
  jwtIssuer: process.env.JWT_ISSUER,
  jwtAlgorithm: process.env.JWT_ALGORITHM || 'RS256',
  defaultAdmin: {
    email: process.env['DEFAULT_USER_EMAIL'],
    password: process.env['DEFAULT_USER_PASSWORD'],
    name: process.env['DEFAULT_USER_NAME'],
  },
});
