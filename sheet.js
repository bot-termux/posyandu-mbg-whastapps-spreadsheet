//https://github.com/bot-termux

const { google } = require("googleapis");

const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json", //GANTI DENGAN FILE CREDENTIAL DARI GOOGLE 
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
});

const spreadsheetId = "11nrPSdmXHT8-KA4Y5sBrOMSsWShKc0dUZIEY6540uEo"; //GANTI DENGAN SPREADSHEET ID MU

async function getSheets() {
    const client = await auth.getClient();
    return google.sheets({
        version: "v4",
        auth: client
    });
}

async function getRows(sheetName) {
    const sheets = await getSheets();
    const result = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: sheetName
    });
    return result.data.values || [];
}

async function findNik(sheetName, nik) {
    const rows = await getRows(sheetName);
    
    const searchNik = String(nik).replace(/\D/g, "");

    for (let i = 1; i < rows.length; i++) {

        const cellValue = String(rows[i][1] || "").replace(/\D/g, "");


        if (cellValue === searchNik && searchNik !== "") {
            return {
                rowNumber: i + 1,
                data: rows[i]
            };
        }
    }
    return null;
}

async function setBalitaFormula(rowNumber) {

    const sheets = await getSheets();

    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Balita!D${rowNumber}`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
            values: [[
                `=DATEDIF(G${rowNumber};TODAY();"M")`
            ]]
        }
    });
}

async function findNikAll(nik) {
    const sheets = ["Balita", "Bumil", "Busui"];

    for (const sheet of sheets) {
        const found = await findNik(sheet, nik);
        if (found) {
            return {
                sheet,
                ...found
            };
        }
    }
    return null;
}

async function getNextNo(sheetName) {
    const rows = await getRows(sheetName);
    
    if (rows.length <= 1) return 1;


    for (let i = rows.length - 1; i >= 1; i--) {
        const noVal = parseInt(rows[i][0] || 0);
        
        if (!isNaN(noVal) && noVal > 0) {
            return noVal + 1;
        }
    }
    
    return 1;
}

async function appendRow(sheetName, values) {
    const sheets = await getSheets();
    await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: sheetName,
        valueInputOption: "USER_ENTERED",
        requestBody: {
            values: [values]
        }
    });
}

async function updateRow(sheetName, rowNumber, values) {
    const sheets = await getSheets();
    const endColumn = String.fromCharCode(64 + values.length);

    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A${rowNumber}:${endColumn}${rowNumber}`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
            values: [values]
        }
    });
}

module.exports = {
    getRows,
    findNik,
    findNikAll,
    getNextNo,
    appendRow,
    updateRow,
    setBalitaFormula
};
