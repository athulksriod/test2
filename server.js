const express = require('express');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = 3000;

let lastPostedData = null; // Variable to store the last posted data

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve the HTML page
app.use(express.static('public'));

// Function to append data to Google Sheets
async function appendToGoogleSheet(data) {
    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const spreadsheetId = process.env.SPREADSHEET_ID;
    const range = 'Sheet1!A1'; // Update with your desired sheet name and range

    await sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: [Object.values(data)],
        },
    });
}

// Handle POST request and store the data
app.post('/', async (req, res) => {
    lastPostedData = req.body;
    console.log('Received POST request:', req.body);
    
    // Append to Google Sheets
    try {
        await appendToGoogleSheet(req.body);
        res.send(`${JSON.stringify(lastPostedData, null, 2)}`);
    } catch (error) {
        console.error('Error appending to Google Sheet:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Handle GET request for retrieving the last posted data
app.get('/lastPostedData', (req, res) => {
    console.log(lastPostedData);
    res.json(lastPostedData);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
