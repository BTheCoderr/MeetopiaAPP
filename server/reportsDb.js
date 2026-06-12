/**
 * Durable report storage via Supabase PostgREST (no extra npm deps).
 * Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY on Render.
 */

function supabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function supabaseHeaders() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  };
}

function supabaseBaseUrl() {
  return process.env.SUPABASE_URL.replace(/\/$/, '');
}

function rowToRecord(row) {
  return {
    id: row.id,
    reporterSocketId: row.reporter_socket_id,
    reportedSocketId: row.reported_socket_id,
    category: row.category,
    timestamp: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    reporterProfile: row.reporter_profile,
    reportedProfile: row.reported_profile,
    sessionId: row.session_id,
    status: row.status,
  };
}

function recordToRow(record) {
  return {
    id: record.id,
    reporter_socket_id: record.reporterSocketId,
    reported_socket_id: record.reportedSocketId,
    category: record.category,
    created_at: new Date(record.timestamp).toISOString(),
    reporter_profile: record.reporterProfile,
    reported_profile: record.reportedProfile,
    session_id: record.sessionId,
    status: record.status || 'new',
  };
}

async function insertReport(record) {
  if (!supabaseConfigured()) return null;

  const res = await fetch(`${supabaseBaseUrl()}/rest/v1/mobile_reports`, {
    method: 'POST',
    headers: {
      ...supabaseHeaders(),
      Prefer: 'return=representation',
    },
    body: JSON.stringify(recordToRow(record)),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Supabase insert failed (${res.status}): ${errText}`);
  }

  const rows = await res.json();
  const saved = Array.isArray(rows) ? rows[0] : rows;
  console.log('[Reports:Supabase] saved', saved?.id, saved?.category);
  return saved ? rowToRecord(saved) : record;
}

async function fetchRecentReports(limit = 50) {
  if (!supabaseConfigured()) return null;

  const res = await fetch(
    `${supabaseBaseUrl()}/rest/v1/mobile_reports?select=*&order=created_at.desc&limit=${limit}`,
    { headers: supabaseHeaders() },
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Supabase fetch failed (${res.status}): ${errText}`);
  }

  const rows = await res.json();
  return Array.isArray(rows) ? rows.map(rowToRecord) : [];
}

module.exports = {
  supabaseConfigured,
  insertReport,
  fetchRecentReports,
};
