// Keep database reads on the web server, including revocation of cached proofs.
async function validateConnection(userId, proof, details = {}) {
  const secret = process.env.SOCKET_AUTH_SECRET;
  if (!secret) return null;
  const base = process.env.WEB_APP_URL || 'https://meetopia-live.netlify.app';
  try {
    const response = await fetch(new URL('/api/internal/signaling/connection', base), {
      method: 'POST',
      headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, proof, ...details }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data && typeof data.connectionId === 'string' && typeof data.otherUserId === 'string'
      ? data : null;
  } catch {
    // Do not relay private events when the current access state cannot be checked.
    return null;
  }
}

module.exports = { validateConnection };
