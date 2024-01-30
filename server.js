const express = require('express');
const app = express();
const cors = require('cors');
const mysql = require('mysql');
const bodyParser = require('body-parser');


app.use(cors({ origin: '*' }));
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = 3000;

const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'firstSoft2023!',
    database: 'appdb',
});


db.connect(err => {
    if (err) console.error(err);
    else  console.log('Connected to MySQL database');
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

app.get('/api/nomenklatura', (req, res) => {
    const sql = 'SELECT * FROM nomenklatura';
    db.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json(result);
        }
    });
});

app.get('/api/kontragent', (req, res) => {
    const sql = 'SELECT * FROM kontragent';
    db.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ err: 'Internal Server Error' })
        } else {
            res.json(result)
        }
    })
})
 
app.get('/api/orders', (req, res) => {
    const sql = 'SELECT * FROM orders';
    db.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ err: 'Internal Server Error' })
        } else {
            res.json(result)
        }
    })
})

app.get('/api/routes', (req, res) => {
    const sql = 'SELECT * FROM routes'
    db.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ err: 'Internal server error' });
        }
        else {
            res.json(result)
        }
    })
})

app.get('/api/casse_orders', (req, res) => {
    const sql = 'SELECT * FROM casse_orders';
    db.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ err: 'Internal server error' })
        }
        else {
            res.json(result)
        }
    })
})

app.get('/api/category', (req, res) => {
    const sql = 'SELECT * FROM category';
    db.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ err: 'Internal server error' })
        }
        else {
            res.json(result)
        }
    })
})

app.get('/api/price', (req,res) => {
    const sql = 'SELECT * FROM price';
    db.query( sql, (err, result) => {
        if(err){
            console.error(err);
            res.status(500).json({err: 'Internal server error'})
        }
        else{
            res.json(result)
        }
    })
})

app.post('/api/nomenklatura', (req, res) => {
    const { date, number, customer, rowsData } = req.body;
    const insertSql = 'INSERT INTO nomenklatura (date, number, customer, product_name, quantity, price) VALUES (?, ?, ?, ?, ?, ?)';
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

app.post('/api/invoice', (req, res) => {
    const { date, number, customer, formTable } = req.body;
    const insertSql = 'INSERT INTO invoice (date, number, customer, product_name, quantity, units, price) VALUES ?';

    const insertValues = formTable.map(item => [
        date,
        number,
        customer,
        item.product_name,
        parseInt(item.quantity),
        item.units,
        parseFloat(item.price),
    ]);

    db.query(insertSql, [insertValues], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.status(200).json({ message: 'Invoice data received successfully' });
        }
    });
});



app.post('/api/kontragent', (req, res) => {
    const { name, phone_number, tin, address } = req.body;
    const insertSql = 'INSERT INTO kontragent (name, phone_number, tin, address) VALUES (?, ?, ?, ?)';
    const insertValues = [name, phone_number, tin, address ];
    db.query(insertSql, insertValues, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.status(200).json({ message: 'Invoice data received successfully' });
        }
    });
});

app.post('/api/contract', (req,res) => {
    const {name, number, date, type, company_name, comment} = req.body;
    const insertSql = 'INSERT INTO contract (name, number, date, type, company_name, comment) VALUES ( ?, ?, ?, ?, ?, ? )';
    const insertValues = [name, number, date, type, company_name, comment]
    db.query(insertSql, insertValues, (err, result) => {
        if(err){
            console.error(err);
            res.status(500).json({ error: 'Insternal server error'})
        }
        else{
            res.status(200).json( { message: 'Contarct data received successfully'})
        }
    })
})

app.post('/api/routes', (req,res) => {
    const { date, kontragentId, amount } = req.body;
    const insertSql = 'INSERT INTO routes ( date, kontragentId, amount ) VALUES ( ?, ?, ? )';
    const insertValues = [ date, kontragentId, amount ]
    db.query(insertSql, insertValues, (err, result) => {
        if(err){
            console.error(err);
            res.status(500).json({ error: 'Insternal server error'})
        }
        else{
            res.status(200).json( { message: 'Contarct data received successfully'})
        }
    })
})

app.post('/api/orders', (req,res) => {
    const { date, amount } = req.body;
    const insertSql = 'INSERT INTO orders ( date, amount ) VALUES ( ?, ? )';
    const insertValues = [ date, amount ]
    db.query(insertSql, insertValues, (err, result) => {
        if(err){
            console.error(err);
            res.status(500).json({ error: 'Internal server error'})
        }
        else{
            res.status(200).json( { message: 'Contarct data received successfully'})
        }
    })
})

app.post('/api/cassa_orders', (req, res) => {
    const {date, kontragentId, amount} = rreq.body;
    const insertSql = 'INSERT INTO casse_orders (date, kontragentId, amount) VALUES (?, ?, ?)';
    const insertValues = [date, kontragentId, amount];
    db.query(insertSql, insertValues, (err, result) => {
        if(err){
            console.error(err);
            res.status(500).json({ error: 'Internal server error'})
        }
        else {
            res.status(200).json( { message: 'Date received'})
        }
    })
})

app.listen(PORT, () => { console.log(`http://192.168.190.57:${PORT}`) });