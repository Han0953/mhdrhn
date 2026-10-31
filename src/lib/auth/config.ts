import 'server-only';

export function getAdminAuthConfig() {
  const username = process.env.ADMIN_USERNAME?.trim();
  const passwordHash = process.env.ADMIN_PASSWORD_HASH?.trim();
  const passwordSalt = process.env.ADMIN_PASSWORD_SALT?.trim() || 'mhdrhn_default_salt_2026';
  const sessionSecret = process.env.ADMIN_SESSION_SECRET?.trim();

  const isConfigured = Boolean(username && passwordHash && sessionSecret);

  return {
    username: username || 'rehan',
    passwordHash: passwordHash || '',
    passwordSalt,
    sessionSecret: sessionSecret || '',
    isConfigured,
  };
}
