import { IPAsset } from '../types';

export interface SheetExportResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
}

export async function exportAssetsToGoogleSheets(
  accessToken: string,
  assets: IPAsset[],
  title = 'IP Assets Portfolio Register'
): Promise<SheetExportResult> {
  // 1. Create a new Google Spreadsheet
  const createResponse = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: `${title} (${new Date().toISOString().split('T')[0]})`,
      },
      sheets: [
        {
          properties: {
            title: 'IP Assets',
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
    }),
  });

  if (!createResponse.ok) {
    const errorBody = await createResponse.text();
    throw new Error(`Failed to create spreadsheet: ${createResponse.status} ${errorBody}`);
  }

  const sheetData = await createResponse.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = sheetData.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // 2. Prepare headers and rows
  const headers = [
    'ID',
    'Asset Name',
    'IP Type',
    'Brand',
    'Application Number',
    'Country',
    'Country Code',
    'Filing Date',
    'Renewal Due Date',
    'Firm / Agent',
    'Applicant',
    'Status',
    'Document Attached',
    'Notes',
    'Last Updated',
  ];

  const rows = assets.map((asset) => [
    asset.id,
    asset.assetName,
    asset.ipType,
    asset.brand || 'General',
    asset.applicationNumber,
    asset.country,
    asset.countryCode,
    asset.filingDate,
    asset.renewalDueDate,
    asset.firmAgent || 'N/A',
    asset.applicant || 'N/A',
    asset.status,
    asset.documentName || 'No document',
    asset.notes,
    asset.updatedAt,
  ]);

  const values = [headers, ...rows];

  // 3. Append data to spreadsheet
  const updateResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'IP Assets'!A1:O${values.length}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: `'IP Assets'!A1:O${values.length}`,
        majorDimension: 'ROWS',
        values,
      }),
    }
  );

  if (!updateResponse.ok) {
    const errorBody = await updateResponse.text();
    throw new Error(`Failed to populate spreadsheet: ${updateResponse.status} ${errorBody}`);
  }

  return {
    spreadsheetId,
    spreadsheetUrl,
  };
}
