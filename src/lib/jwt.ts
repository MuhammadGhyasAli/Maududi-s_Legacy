const JWT_SECRET = process.env.JWT_SECRET_KEY || 'hTJhfugyjHMNMVtyTFctreWRefu6593kMui#$465';
const JWT_EXPIRATION_MINUTES = parseInt(process.env.JWT_EXPIRATION_MINUTES || '1440', 10);

export function getJwtSecret(): string {
  return JWT_SECRET;
}

export function getJwtExpirationSeconds(): number {
  return JWT_EXPIRATION_MINUTES * 60;
}
