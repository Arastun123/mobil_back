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
    else console.log('Connected to MySQL database');
});


app.get('/api/:tableName/:formatDate?', (req, res) => {
    const { tableName, formatDate } = req.params;

    let sql = `SELECT * FROM ${tableName}`;

    if (formatDate === 'true') {
        sql = `SELECT *, DATE_FORMAT(date, '%Y-%m-%d') AS date FROM ${tableName}`;
    }

    db.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            if (formatDate === 'true') {
                const formattedResult = result.map(row => {
                    return { ...row, };
                });
                res.json(formattedResult);
            } else {
                res.json(result);
            }
        }
    });
});


app.get('/endpoint/autoProducts', (req, res) => {
    const query = req.query.query.toLowerCase();

    db.query('SELECT * FROM products WHERE name LIKE ?', [`%${query}%`], (error, results) => {
        if (error) {
            console.error('Error executing MySQL query:', error);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        res.json(results);
    });
});

app.post('/api/invoice', (req, res) => {
    const { date, number, customer, formTable } = req.body;
    const insertSql = 'INSERT INTO invoice (date, number, customer, quantity, price, product_name) VALUES ?';

    const insertValues = formTable.map(item => [
        date,
        number,
        customer,
        parseInt(item.quantity),
        parseFloat(item.price),
        item.product_name,
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
    const { name, phone_number, tin, address, type } = req.body;
    const insertSql = 'INSERT INTO kontragent (name, phone_number, tin, address, type) VALUES (?, ?, ?, ?, ?)';
    const insertValues = [name, phone_number, tin, address, type];
    db.query(insertSql, insertValues, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.status(200).json({ message: 'Invoice data received successfully' });
        }
    });
});

app.post('/api/nomenklatura', (req, res) => {
    const { name, category, brand, price, kind } = req.body;
    const insertSql = 'INSERT INTO nomenklatura (name, category, brand, price, kind) VALUES (?, ?, ?, ?, ?)';
    const insertValues = [name, category, brand, price, kind];
    db.query(insertSql, insertValues, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' })
        }
        else {
            res.status(200).json({ message: 'Nomenklatura data received successfully' });
        }
    })
})

app.post('/api/contract', (req, res) => {
    const { name, number, date, type, company_name, comment } = req.body;
    const insertSql = 'INSERT INTO contract (name, number, date, type, company_name, comment) VALUES ( ?, ?, ?, ?, ?, ? )';
    const insertValues = [name, number, date, type, company_name, comment]
    db.query(insertSql, insertValues, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Insternal server error' })
        }
        else {
            res.status(200).json({ message: 'Contarct data received successfully' })
        }
    })
})

app.post('/api/routes', (req, res) => {
    const { date, kontragentId, amount } = req.body;
    const insertSql = 'INSERT INTO routes ( date, kontragentId, amount ) VALUES ( ?, ?, ? )';
    const insertValues = [date, kontragentId, amount]
    db.query(insertSql, insertValues, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Insternal server error' })
        }
        else {
            res.status(200).json({ message: 'Contarct data received successfully' })
        }
    })
})

app.post('/api/orders', (req, res) => {
    const { date, customer, formTable } = req.body;
    const insertSql = 'INSERT INTO orders (date, customer, product_name, price, quantity, units) VALUES ?';

    const insertValues = formTable.map(item => [
        date,
        customer,
        item.product_name,
        parseFloat(item.price),
        parseInt(item.quantity),
        item.units,
    ]);

    db.query(insertSql, [insertValues], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.status(200).json({ message: 'Invoice data received successfully' });
        }
    });
})

app.post('/api/cassa_orders', (req, res) => {
    const { date, kontragentId, amount } = req.body;
    const insertSql = 'INSERT INTO casse_orders (date, kontragentId, amount) VALUES (?, ?, ?)';
    const insertValues = [date, kontragentId, amount];
    db.query(insertSql, insertValues, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' })
        }
        else {
            res.status(200).json({ message: 'Date received' })
        }
    })
})

app.post('/api/products', (req, res) => {
    const { formTable } = req.body;
    const newNames = formTable.map(item => item.name);

    const selectSql = 'SELECT name FROM products WHERE name IN (?)';
    db.query(selectSql, [newNames], (selectErr, selectResult) => {
        if (selectErr) {
            console.error(selectErr);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        const existingNames = selectResult.map(row => row.name);
        const namesToInsert = newNames.filter(name => !existingNames.includes(name));

        if (namesToInsert.length > 0) {
            const insertSql = 'INSERT INTO products (name) VALUES ?';
            const insertValues = namesToInsert.map(name => [name]);

            db.query(insertSql, [insertValues], (insertErr, insertResult) => {
                if (insertErr) {
                    console.error(insertErr);
                    res.status(500).json({ error: 'Internal server error' });
                } else {
                    res.status(200).json({ message: 'Data received' });
                }
            });
        } else {
            res.status(400).json({ message: 'All data already exists in the database' });
        }
    });
});


app.put('/api/invoice', (req, res) => {
    const { newRows, date, customer, number } = req.body;

    if (Array.isArray(newRows)) {
        let totalAffectedRows = 0;
        let processedRows = 0;

        newRows.forEach(updatedRow => {
            const updateSql = `UPDATE invoice SET quantity=?, price=?, product_name=?, date=?, customer=?, number=? WHERE id=?`;
            const updateValues = [updatedRow.quantity, updatedRow.price, updatedRow.product_name, date, customer, number, updatedRow.id];

            db.query(updateSql, updateValues, (err, result) => {
                if (err) {
                    console.error(err);
                    res.status(500).json({ success: false, message: 'Internal server error' });
                    return;
                }

                totalAffectedRows += result.affectedRows;
                processedRows++;

                if (processedRows === newRows.length) {
                    if (totalAffectedRows > 0) {
                        res.status(200).json({ success: true, message: 'Məlumat yeniləndi' });
                    } else {
                        res.status(404).json({ success: false, message: 'Record not found' });
                    }
                }
            });
        });
    } else {
        console.error('data is not an array');
        res.status(500).json({ error: 'Internal server error' });
    }
});




app.put('/api/edit/orders', (req, res) => {
    const { updatedRows } = req.body;
    let updatesCompleted = 0;

    updatedRows.forEach(updatedRow => {
        const updateSql = `UPDATE orders SET price=?, quantity=?, product_name=?, units=?, date=?, customer=? WHERE id=?`
        const updateValues = [updatedRow.price, updatedRow.quantity, updatedRow.product_name, updatedRow.units, updatedRow.date, updatedRow.customer, updatedRow.id];

        db.query(updateSql, updateValues, (error, result) => {
            if (error) {
                console.error(error);
                res.status(500).json({ success: false, message: 'Internal server error' });
            } else {
                if (result.affectedRows > 0) {
                    // console.log(`Data updated successfully`);
                } else {
                    console.log(`Row with id ${updatedRow.id} not found`);
                }
            }

            updatesCompleted++;

            if (updatesCompleted === updatedRows.length) {
                res.status(200).json({ success: true, message: 'Məlumatlar yeniləndi' });
            }
        });
    });
});

app.put('/api/edit/kontragent', (req, res) => {
    const {updatedRows} = req.body;
    let updatesCompleted = 0;
    updatedRows.forEach(updatedRow => {
        const updateSql = `UPDATE kontragent SET name=?, phone_number=?, tin=?, address=?, type=? WHERE id=?`;
        const updateValues = [updatedRow.name, updatedRow.phone_number, updatedRow.tin, updatedRow.address, updatedRow.type, updatedRow.id];
       
        db.query(updateSql, updateValues, (error, result) => {
            if (error) {
                console.error(error);
                res.status(500).json({ success: false, message: 'Internal server error' });
            } else {
                if (result.affectedRows > 0) {
                    // console.log(`Data updated successfully`);
                } else {
                    console.log(`Row with id ${updatedRow.id} not found`);
                }
            }

            updatesCompleted++;

            if (updatesCompleted === updatedRows.length) {
                res.status(200).json({ success: true, message: 'Məlumatlar yeniləndi' });
            }
        });
    })
})

app.put('/api/edit/:tableName', (req, res) => {
    const { tableName } = req.params;
    const { updatedRows } = req.body;

    if (Array.isArray(updatedRows)) {
        let totalAffectedRows = 0;
        let processedRows = 0;

        updatedRows.forEach(updatedRow => {
            const updateSql = `UPDATE ${tableName} SET name=?, category=?, brand=?, price=?, kind=? WHERE id=?`;
            const updateValues = [updatedRow.name, updatedRow.category, updatedRow.brand, updatedRow.price, updatedRow.kind, updatedRow.id];

            db.query(updateSql, updateValues, (err, result) => {
                if (err) {
                    console.error(err);
                    res.status(500).json({ success: false, message: 'Internal server error' });
                    return;
                }

                totalAffectedRows += result.affectedRows;
                processedRows++;

                if (processedRows === updatedRows.length) {
                    if (totalAffectedRows > 0) {
                        res.status(200).json({ success: true, message: 'Məlumat yeniləndi' });
                    } else {
                        res.status(404).json({ success: false, message: 'Record not found' });
                    }
                }
            });
        });
    } else {
        console.error('data is not an array');
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.put('/api/products', (req, res) => {
    const updatedDataArray = req.body;

    try {
        for (const updatedData of updatedDataArray) {
            const { id, name } = updatedData;

            const updateSql = 'UPDATE products SET name = ? WHERE id = ?';
            const updateValues = [name, id];

            db.query(updateSql, updateValues, (err, result) => {
                if (err) {
                    console.error(err);
                    res.status(500).json({ success: false, message: 'Internal server error' });
                }
            });
        }

        res.status(200).json({ success: true, message: 'Məlumatlar yeniləndi' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.delete('/api/delete/:id/:tableName', (req, res) => {
    const { id, tableName } = req.params;
    const deleteSql = `DELETE FROM ${tableName} WHERE id = ?`
    db.query(deleteSql, [id, tableName], (error, result) => {
        if (error) {
            console.error(error)
            res.status(500).json({ error: 'Internal server error' })
        } else {
            res.status(200).json({ message: 'Məlumat silindi' })
        }
    })
})


app.put('/api/edit/:id', (req, res) => {
    const { id, tableName } = req.params;
    const newData = req.body;
    const updateSql = `UPDATE ${tableName} SET ? WHERE id = ?`;

    db.query(updateSql, [newData, id], (error, result) => {
        if (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        } else {
            res.status(200).json({ message: 'Məlumat yeniləndi' });
        }
    });

})

app.listen(PORT, () => { console.log(`http://192.168.88.44:${PORT}`) });