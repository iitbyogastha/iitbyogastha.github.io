const SHEET_NAME = "Submissions";

// Handles POST requests from the quiz submission
function doPost(e) {
  try {
    // We expect the payload to be text/plain to avoid CORS preflight,
    // so we parse the raw POST body (e.postData.contents).
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME) || SpreadsheetApp.getActiveSpreadsheet().insertSheet(SHEET_NAME);
    
    // Add headers if the sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Timestamp", "Name", "Score", "Total", "Time (seconds)", "Submitted At"]);
    }
    
    // Append the row
    sheet.appendRow([
      new Date(),
      data.name,
      data.score,
      data.total,
      data.elapsedSeconds,
      data.submittedAt
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ "status": "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handles GET requests to render the global leaderboard
function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Skip headers (data[0]) and map rows to JSON
    const rows = data.slice(1);
    const result = rows.map(row => {
      return {
        name: row[1],
        score: row[2],
        total: row[3],
        elapsedSeconds: row[4],
        submittedAt: row[5]
      };
    });
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
