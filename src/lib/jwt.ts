function getJwtSecretFromEnv(): string {
  const secret = process.env.JWT_SECRET_KEY;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET_KEY environment variable is required in production');
    }
    return 'dev-secret-do-not-use-in-production';
  }
  return secret;
}

const JWT_SECRET = getJwtSecretFromEnv();
const JWT_EXPIRATION_MINUTES = parseInt(process.env.JWT_EXPIRATION_MINUTES || '1440', 10);

export function getJwtSecret(): string {
  return JWT_SECRET;
}

export function getJwtExpirationSeconds(): number {
  return JWT_EXPIRATION_MINUTES * 60;
}
