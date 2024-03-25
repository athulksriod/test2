const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;

// Connect to MongoDB
mongoose.connect('mongodb+srv://athulksriod:E4zExGpJmLyjIjur@cluster0.xu1dkrf.mongodb.net/',)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Define schema and model for data
const dataSchema = new mongoose.Schema({
    content: String
});

const Data = mongoose.model('Data', dataSchema);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve the HTML page
app.use(express.static('public'));

// Handle POST request and store the data in MongoDB
app.post('/', (req, res) => {
    try {
        const createEntry = Data.create(JSON.stringify(req.body, null, 2));
        console.log('Received and saved new data:', req.body);
        res.send(JSON.stringify(req.body, null, 2)); // Corrected response syntax
    } catch (err) {
        console.error('Error saving data:', err);
        res.status(500).send('Error saving data');
    }
});

// Handle GET request for retrieving the last 10 posted data from MongoDB
app.get('/', (req, res) => {
    try {
        const last10Data = Data.find().sort({ _id: -1 }).limit(10);
        console.log('Retrieved last 10 data:', last10Data);
        res.json(last10Data.reverse());
    } catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).send('Error retrieving data');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
