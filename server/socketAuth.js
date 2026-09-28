const { createHmac, timingSafeEqual } = require('crypto');

function getSecret() {
  return process.env.SOCKET_AUTH_SECRET || '';
}

function signature(body) {
  const secret = getSecret();
  if (!secret) return '';
  return createHmac('sha256', secret).update(body).digest('base64url');
}

function verifySignedPayload(token) {
  if (!token || typeof token !== 'string' || !getSecret()) return null;
  const [body, providedSignature] = token.split('.');
  if (!body || !providedSignature) return null;

  const expected = signature(body);
  const a = Buffer.from(providedSignature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

function verifySocketToken(token) {
  const payload = verifySignedPayload(token);
  if (!payload || typeof payload.sub !== 'string') return null;
  return payload;
}

function createConnectionProof(userIdA, userIdB) {
  if (!getSecret()) return null;
  const users = [userIdA, userIdB].sort();
  const payload = {
    type: 'connection',
    users,
    exp: Date.now() + 2 * 60 * 1000,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${body}.${signature(body)}`;
}

function verifyDirectCallProof(token) {
  const payload = verifySignedPayload(token);
  if (!payload || payload.type !== 'direct-call') return null;
  if (
    typeof payload.callerId !== 'string' ||
    typeof payload.calleeId !== 'string' ||
    typeof payload.connectionId !== 'string'
  ) {
    return null;
  }
  return payload;
}

module.exports = {
  verifySocketToken,
  createConnectionProof,
  verifyDirectCallProof,
};
