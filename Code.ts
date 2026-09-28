/**
 * SidTech Google Sheets API backend
 * Deploy this Apps Script as a Web App.
 * The frontend talks to this endpoint using POST JSON.
 */

const DB_VERSION = 'sidtech-v1';
const SHEETS: Record<string, string[]> = {
  Franchises: ['franchiseId','name','email','mobile','branchName','address','passwordHash','tPinHash','tPinSet','status','rejectionReason','photoUrl','registeredOn','approvedOn','walletBalance','totalEarned','totalWithdrawn'],
  Services: ['serviceId','serviceName','description','price','advancePercent','commissionPercent','category','imageUrl','active'],
  Projects: ['projectId','franchiseId','serviceId','serviceName','clientName','clientMobile','requirementNotes','finalPrice','advancePercent','advanceRequired','amountPaid','amountDue','status','statusColor','demoUrl','finalUrl','commissionPercent','commissionAmount','createdOn','acceptedOn','deliveredOn','certificateUrl','certificateNumber','rejectionReason'],
  Payments: ['paymentId','projectId','franchiseId','franchiseName','amount','mode','utr','paymentGatewayRef','status','submittedOn','verifiedOn','verifiedBy','rejectionReason'],
  Payouts: ['payoutId','franchiseId','franchiseName','amount','walletBalanceAtRequest','status','mode','requestedOn','processedOn','referenceNote','rejectionReason','upiId'],
  Settings: ['key','value'],
  Notifications: ['notifId','franchiseId','message','type','read','createdOn','targetId'],
  ActivityLogs: ['logId','actor','action','entity','entityId','details','createdOn'],
  Counters: ['key','value']
};

function doGet(): GoogleAppsScript.Content.TextOutput {
  return json({ ok: true, service: 'SidTech API', version: DB_VERSION });
}

function doPost(e: GoogleAppsScript.Events.DoPost): GoogleAppsScript.Content.TextOutput {
  try {
    const body = JSON.parse(e.postData?.contents || '{}');
    const action = String(body.action || '');
    ensureDatabase();

    switch (action) {
      case 'health': return json({ ok: true, version: DB_VERSION });
      case 'bootstrap': return json({ ok: true, data: readAllTables() });
      case 'table.list': return json({ ok: true, rows: readTable(String(body.table)) });
      case 'table.replace':
        replaceTable(String(body.table), Array.isArray(body.rows) ? body.rows : []);
        return json({ ok: true });
      case 'row.upsert':
        return json({ ok: true, row: upsertRow(String(body.table), body.row || {}) });
      case 'row.delete':
        deleteRow(String(body.table), String(body.id || ''), String(body.idField || ''));
        return json({ ok: true });
      case 'counter.next':
        return json({ ok: true, value: nextCounter(String(body.key || 'default')) });
      case 'settings.get': return json({ ok: true, rows: readTable('Settings') });
      case 'settings.set':
        setSetting(String(body.key), body.value);
        return json({ ok: true });
      default:
        return json({ ok: false, error: 'Unknown action' }, 400);
    }
  } catch (err) {
    return json({ ok: false, error: String(err) }, 500);
  }
}

function ensureDatabase(): void {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(SHEETS).forEach(name => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) sheet = ss.insertSheet(name);
    const headers = SHEETS[name];
    const current = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
    const same = headers.every((h, i) => current[i] === h);
    if (!same) sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  });
}

function readTable(table: string): Record<string, unknown>[] {
  assertTable(table);
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(table)!;
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = SHEETS[table];
  return values.slice(1).filter(row => row.some(v => v !== '')).map(row => {
    const obj: Record<string, unknown> = {};
    headers.forEach((h, i) => obj[h] = normalizeValue(row[i]));
    return obj;
  });
}

function readAllTables(): Record<string, unknown[]> {
  const out: Record<string, unknown[]> = {};
  Object.keys(SHEETS).forEach(name => out[name] = readTable(name));
  return out;
}

function replaceTable(table: string, rows: Record<string, unknown>[]): void {
  assertTable(table);
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(table)!;
  const headers = SHEETS[table];
  if (sheet.getLastRow() > 1) sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).clearContent();
  if (!rows.length) return;
  const values = rows.map(row => headers.map(h => serializeValue(row[h])));
  sheet.getRange(2, 1, values.length, headers.length).setValues(values);
}

function upsertRow(table: string, row: Record<string, unknown>): Record<string, unknown> {
  assertTable(table);
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(table)!;
  const headers = SHEETS[table];
  const idField = headers[0];
  const id = String(row[idField] || '');
  if (!id) throw new Error(`Missing primary key: ${idField}`);

  const data = sheet.getDataRange().getValues();
  let targetRow = -1;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === id) { targetRow = i + 1; break; }
  }
  const values = [headers.map(h => serializeValue(row[h]))];
  if (targetRow === -1) sheet.getRange(sheet.getLastRow() + 1, 1, 1, headers.length).setValues(values);
  else sheet.getRange(targetRow, 1, 1, headers.length).setValues(values);
  return row;
}

function deleteRow(table: string, id: string, idField: string): void {
  assertTable(table);
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(table)!;
  const headers = SHEETS[table];
  const index = idField ? headers.indexOf(idField) : 0;
  if (index < 0) throw new Error('Invalid idField');
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][index]) === id) { sheet.deleteRow(i + 1); return; }
  }
}

function nextCounter(key: string): number {
  const rows = readTable('Counters') as Record<string, unknown>[];
  const current = rows.find(r => String(r.key) === key);
  const value = Number(current?.value || 0) + 1;
  upsertRow('Counters', { key, value });
  return value;
}

function setSetting(key: string, value: unknown): void {
  upsertRow('Settings', { key, value: JSON.stringify(value) });
}

function assertTable(table: string): void {
  if (!SHEETS[table]) throw new Error(`Unknown table: ${table}`);
}

function normalizeValue(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
}

function serializeValue(value: unknown): unknown {
  if (value === undefined || value === null) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return value;
}

function json(data: unknown, status = 200): GoogleAppsScript.Content.TextOutput {
  return ContentService.createTextOutput(JSON.stringify({ ...((data as Record<string, unknown>) || {}), status }))
    .setMimeType(ContentService.MimeType.JSON);
}
