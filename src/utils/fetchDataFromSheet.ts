import { google, sheets_v4 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import path from 'path';

interface SheetData {
    month: string;
    source: string;
    transactionAmount: number;
}

async function fetchDataFromSheet(): Promise<SheetData[]> {
    const keyFilePath = path.resolve(__dirname, './../../composite-set-387023-860eb506c3cc.json');

    const auth = new google.auth.GoogleAuth({
        keyFile: keyFilePath,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const client = (await auth.getClient()) as OAuth2Client;

    const googleSheets: sheets_v4.Sheets = google.sheets({ version: 'v4', auth: client });

    const spreadsheetId = '1lIgkPJ3hJ6VTRjF7h8Ur5r_8iTxXA3CERuN-ofL0Rzk';
    const metaData = await googleSheets.spreadsheets.get({
        auth,
        spreadsheetId,
    });

    const sheetName = metaData.data.sheets?.[0].properties?.title;
    if (!sheetName) {
        throw new Error('Sheet not found');
    }

    const res = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range: `${sheetName}!A1:Z1000`,
    });

    const values: string[][] = res.data.values || [];

    const data: SheetData[] = values.map(row => ({
        month: row[0],
        source: row[1],
        transactionAmount: Number(row[2]),
    }));

    return data;
}

export default fetchDataFromSheet;
