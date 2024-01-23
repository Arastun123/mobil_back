const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');

app.use(cors({ origin: '*' }));
app.use(bodyParser.json({ extended: true }));


const PORT = 3000;

const newData = [
    {
        "id": 1,
        "name": "Computer",
        "count": 2,
        "price": 2000,
    },
    {
        "id": 2,
        "name": "Phone",
        "count": 1,
        "price": 1800,
    },
    {
        "id": 3,
        "name": "Mouse",
        "count": 3,
        "price": 20,
    },
    {
        "id": 4,
        "name": "Monitor",
        "count": 5,
        "price": 500,
    },
];

app.get('/api/data', (req, res) => {
    res.json(newData);
});

app.post('/api/invoice', (req, res) => {
    console.log('Received Invoice Data:', req.body);
    const { date, number, customer, rowsData } = req.body;
    newData.push(req.body)
    console.log('Data Structure:', typeof res);
    res.status(200).json({ message: 'Invoice data received successfully' });
});

app.get('/api/invoice', (req, res) => {
    res.send(newData);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://192.168.88.41:${PORT}`);
});



