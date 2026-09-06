/**
 * Force Check — lead collector for Google Sheets.
 *
 * Paste this into Extensions → Apps Script on the spreadsheet that should
 * hold the list, then Deploy → New deployment → Web app
 *   Execute as:      Me
 *   Who has access:  Anyone
 * Copy the /exec URL into config.js.
 */

var SHEET_NAME = 'Leads';
var HEADERS = [
  'Timestamp', 'First name', 'Email', 'Experience',
  'Page', 'Referrer', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content'
];

function doGet() {
  return json_({ ok: true, service: 'force-check', time: new Date().toISOString() });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);

    var data = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    // Honeypot: a bot filled the hidden field. Accept silently, store nothing.
    if (data.company) return json_({ ok: true });

    var email = String(data.email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return json_({ ok: false, error: 'invalid email' });
    }

    var sheet = getSheet_();
    var row = findRow_(sheet, email);

    if (data.type === 'segment') {
      // Follow-up answer from the thank-you page — only ever updates a known row.
      if (row) sheet.getRange(row, 4).setValue(String(data.experience || ''));
      return json_({ ok: true, updated: !!row });
    }

    var values = [
      new Date(),
      String(data.first_name || '').trim(),
      email,
      row ? sheet.getRange(row, 4).getValue() : '',   // keep an existing answer
      String(data.page || ''),
      String(data.referrer || ''),
      String(data.utm_source || ''),
      String(data.utm_medium || ''),
      String(data.utm_campaign || ''),
      String(data.utm_content || '')
    ];

    if (row) {
      sheet.getRange(row, 1, 1, values.length).setValues([values]);
      return json_({ ok: true, duplicate: true });
    }

    sheet.appendRow(values);
    return json_({ ok: true });

  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (ignored) {}
  }
}

/* ---------- helpers ---------- */

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/** Row number of an existing subscriber, or 0. */
function findRow_(sheet, email) {
  var last = sheet.getLastRow();
  if (last < 2) return 0;
  var col = sheet.getRange(2, 3, last - 1, 1).getValues();
  for (var i = 0; i < col.length; i++) {
    if (String(col[i][0]).trim().toLowerCase() === email) return i + 2;
  }
  return 0;
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
