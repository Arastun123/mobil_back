const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

 
app.use(cors());

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
        "price": 150,
    },
];

app.get('/api/data', (req, res) => {
    res.json(newData);
});


app.listen(PORT, () => {
    console.log(`Server is running on http://192.168.88.41:${PORT}`);
});