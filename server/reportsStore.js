const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

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

/**
 * @param {object} input
 * @returns {object} saved report record
 */
function saveReport(input) {
  ensureDataDir();

  const record = {
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

  fs.appendFileSync(REPORTS_FILE, `${JSON.stringify(record)}\n`, 'utf8');
  console.log('[Reports] saved', record.id, record.category);
  return record;
}

function readRecentReports(limit = 50) {
  ensureDataDir();
  if (!fs.existsSync(REPORTS_FILE)) return [];

  const lines = fs
    .readFileSync(REPORTS_FILE, 'utf8')
    .split('\n')
    .filter(Boolean);

  return lines
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

  const body = [
    `New Meetopia report: ${record.category}`,
    '',
    `Report ID: ${record.id}`,
    `Time: ${new Date(record.timestamp).toISOString()}`,
    `Session: ${record.sessionId || '(unknown)'}`,
    '',
    `Reporter socket: ${record.reporterSocketId}`,
    `Reporter profile: ${profileSummary(record.reporterProfile)}`,
    '',
    `Reported socket: ${record.reportedSocketId}`,
    `Reported profile: ${profileSummary(record.reportedProfile)}`,
    '',
    'Review process: https://meetopia-live.netlify.app/safety',
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

module.exports = {
  saveReport,
  readRecentReports,
  notifyReportEmail,
  sessionIdFor,
};
