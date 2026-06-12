const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const { supabaseConfigured, insertReport, fetchRecentReports } = require('./reportsDb');

const DATA_DIR = path.join(__dirname, 'data');
const REPORTS_FILE = path.join(DATA_DIR, 'reports.jsonl');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function sessionIdFor(reporterSocketId, reportedSocketId) {
  if (!reporterSocketId || !reportedSocketId) return null;
  const ids = [reporterSocketId, reportedSocketId].sort();
  return `${ids[0]}:${ids[1]}`;
}

function buildRecord(input) {
  return {
    id: randomUUID(),
    reporterSocketId: input.reporterSocketId,
    reportedSocketId: input.reportedSocketId,
    category: input.category || input.reason || 'other',
    timestamp: input.timestamp || Date.now(),
    reporterProfile: input.reporterProfile || null,
    reportedProfile: input.reportedProfile || null,
    sessionId: input.sessionId || sessionIdFor(input.reporterSocketId, input.reportedSocketId),
    status: 'new',
  };
}

function saveReportJsonl(record) {
  ensureDataDir();
  fs.appendFileSync(REPORTS_FILE, `${JSON.stringify(record)}\n`, 'utf8');
  console.log('[Reports:JSONL] saved', record.id, record.category);
}

function readRecentReportsJsonl(limit = 50) {
  ensureDataDir();
  if (!fs.existsSync(REPORTS_FILE)) return [];

  return fs
    .readFileSync(REPORTS_FILE, 'utf8')
    .split('\n')
    .filter(Boolean)
    .slice(-limit)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .reverse();
}

/**
 * Primary: Supabase. Fallback: JSONL (ephemeral on Render). Always attempt email after save.
 */
async function saveReport(input) {
  const record = buildRecord(input);

  if (supabaseConfigured()) {
    try {
      const saved = await insertReport(record);
      await notifyReportEmail(saved || record);
      return saved || record;
    } catch (err) {
      console.error('[Reports:Supabase] insert failed, falling back to JSONL', err.message);
    }
  } else {
    console.warn('[Reports] SUPABASE_URL not set — using JSONL only (not durable on Render)');
  }

  saveReportJsonl(record);
  await notifyReportEmail(record);
  return record;
}

async function readRecentReports(limit = 50) {
  if (supabaseConfigured()) {
    try {
      const rows = await fetchRecentReports(limit);
      if (rows) return rows;
    } catch (err) {
      console.error('[Reports:Supabase] fetch failed, falling back to JSONL', err.message);
    }
  }
  return readRecentReportsJsonl(limit);
}

function profileSummary(profile) {
  if (!profile || typeof profile !== 'object') return '(none)';
  const parts = [profile.name, profile.age, profile.city, profile.intent].filter(Boolean);
  return parts.length ? parts.join(', ') : JSON.stringify(profile);
}

async function notifyReportEmail(record) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.REPORT_NOTIFY_EMAIL;
  const from = process.env.REPORT_FROM_EMAIL || 'Meetopia Reports <onboarding@resend.dev>';

  if (!apiKey || !to) {
    console.log('[Reports] email skipped (set RESEND_API_KEY and REPORT_NOTIFY_EMAIL)');
    return;
  }

  const storage = supabaseConfigured() ? 'Supabase (primary)' : 'JSONL fallback only';

  const body = [
    `New Meetopia report: ${record.category}`,
    '',
    `Report ID: ${record.id}`,
    `Storage: ${storage}`,
    `Time: ${new Date(record.timestamp).toISOString()}`,
    `Session: ${record.sessionId || '(unknown)'}`,
    '',
    `Reporter socket: ${record.reporterSocketId}`,
    `Reporter profile: ${profileSummary(record.reporterProfile)}`,
    '',
    `Reported socket: ${record.reportedSocketId}`,
    `Reported profile: ${profileSummary(record.reportedProfile)}`,
    '',
    'Review: Supabase table mobile_reports, or GET /admin/reports',
    'Process: https://meetopia-live.netlify.app/safety',
  ].join('\n');

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `[Meetopia] Report: ${record.category}`,
        text: body,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[Reports] email failed', res.status, errText);
      return;
    }
    console.log('[Reports] email sent to', to);
  } catch (err) {
    console.error('[Reports] email error', err);
  }
}

function getReportBackendStatus() {
  return {
    supabase: supabaseConfigured(),
    email: Boolean(process.env.RESEND_API_KEY && process.env.REPORT_NOTIFY_EMAIL),
    jsonlFallback: true,
  };
}

module.exports = {
  saveReport,
  readRecentReports,
  notifyReportEmail,
  sessionIdFor,
  getReportBackendStatus,
};
