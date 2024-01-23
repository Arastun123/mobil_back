const app = express();
const cors = require('cors');
const mysql = require('mysql');
const express = require('express');
const bodyParser = require('body-parser');

app.use(cors({ origin: '*' }));
app.use(bodyParser.json({ extended: true }));

const PORT = 3000;

const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'firstSoft2023!',
    database: 'appdb',
});


db.connect(err => {
    if (err) {
        console.error(err);
    } else {
        console.log('Connected to MySQL database');
    }
});

app.get('/api/data', (req, res) => {
    const sql = 'SELECT * FROM invoice';
    db.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json(result);
        }
    });
});

app.post('/api/invoice', (req, res) => {
    const { date, number, customer, rowsData } = req.body;
    const insertSql = 'INSERT INTO invoice (date, number, customer, product_name, quantity, price) VALUES (?, ?, ?, ?, ?, ?)';
    const insertValues = [date, number, customer, rowsData[0].product_name, rowsData[0].quantity, rowsData[0].price];
    db.query(insertSql, insertValues, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.status(200).json({ message: 'Invoice data received successfully' });
        }
    });
});

app.get('/api/invoice', (req, res) => {
    const sql = 'SELECT * FROM invoice';
    db.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json(result);
        }
    });
});

app.listen(PORT, () => { console.log(`http://192.168.88.41:${PORT}`) });
