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
            res.status(500).json({ error: 'Error' });
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


app.get("/endpoint/autoFill", (req, res) => {
    const tableName = req.query.tableName;
    const query = req.query.query.toLocaleLowerCase();

    if (!tableName) {
        return res.status(400).json({ error: "tableName parameter is missing" });
    }

    const sqlQuery = `SELECT * FROM ${tableName} WHERE name LIKE ?`;

    db.query(sqlQuery, [`%${query}%`], (error, result) => {
        if (error) {
            console.error("Database query error:", error);
            return res.status(500).json({ error: "Internal server error" });
        }

        res.json(result);
    });
});



const insertIntoTable = (req, res, tableName, columns, values) => {
    const insertSql = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`;
    db.query(insertSql, values, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Error' });
        } else {
            res.status(200).json({ message: 'success' });
        }
    });
};

app.post('/api/kontragent', (req, res) => {
    const tableName = 'kontragent';
    const columns = ['name', 'phone_number', 'tin', 'address', 'type'];
    const values = columns.map(col => req.body[col]);
    insertIntoTable(req, res, tableName, columns, values);
});

app.post('/api/nomenklatura', (req, res) => {
    const tableName = 'nomenklatura';
    const columns = ['name', 'category', 'brand', 'price', 'kind'];
    const values = columns.map(col => req.body[col]);
    insertIntoTable(req, res, tableName, columns, values);
});

app.post('/api/contract', (req, res) => {
    const tableName = 'contract';
    const columns = ['name', 'number', 'date', 'type', 'company_name', 'comment'];
    const values = columns.map(col => req.body[col]);
    insertIntoTable(req, res, tableName, columns, values);
});

app.post('/api/routes', (req, res) => {
    const tableName = 'routes';
    const columns = ['date', 'kontragentId', 'amount'];
    const values = columns.map(col => req.body[col]);
    insertIntoTable(req, res, tableName, columns, values);
});

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
            res.status(500).json({ error: 'Error' });
        } else {
            res.status(200).json({ message: 'success' });
        }
    });
});

app.post('/api/cassa_orders', (req, res) => {
    const tableName = 'cassa_orders';
    const columns = ['date', 'kontragentId', 'amount'];
    const values = columns.map(col => req.body[col]);
    insertIntoTable(req, res, tableName, columns, values);
});

app.post('/api/invoice', async (req, res) => {
    const { date, number, customer, formTable } = req.body;

    try {
        await db.beginTransaction();

        const insertInvoiceSql = 'INSERT INTO invoice (date, number, customer, quantity, price, product_name) VALUES ?';
        const invoiceValues = formTable.map(item => [
            date,
            number,
            customer,
            parseInt(item.quantity),
            parseFloat(item.price),
            item.product_name,
        ]);

        const invoiceIds = [];

        const result = await new Promise((resolve, reject) => {
            db.query(insertInvoiceSql, [invoiceValues], (error, result) => {
                if (error) {
                    console.error(error);
                    reject(error);
                    return;
                }
                for (let i = 0; i < result.affectedRows; i++) {
                    invoiceIds.push(result.insertId + i);
                }
                resolve(result);
            });
        });

        const insertSql = `INSERT INTO nomenklatura (name, category, brand, price, kind, invoice_id) VALUES ?`;
        const values = formTable.map((item, index) => [
            item.product_name,
            'category',
            'brand',
            parseFloat(item.price),
            'satış',
            invoiceIds[index],
        ]);

        await db.query(insertSql, [values]);

        await db.commit();

        res.status(200).json({ message: 'success' });
    } catch (error) {
        await db.rollback();

        console.error(error);
        res.status(500).json({ error: 'Error' });
    }
});

app.post('/api/products', (req, res) => {
    const { formTable } = req.body;
    const newNames = formTable.map(item => item.name);

    const selectSql = 'SELECT name FROM products WHERE name IN (?)';
    db.query(selectSql, [newNames], (selectErr, selectResult) => {
        if (selectErr) {
            console.error(selectErr);
            res.status(500).json({ error: 'error' });
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
                    res.status(500).json({ error: 'error' });
                } else {
                    res.status(200).json({ message: 'received' });
                }
            });
        } else {
            res.status(400).json({ message: 'data exists' });
        }
    });
});

const updateRows = async (tableName, updateSql, values, res) => {
    const sqlQuery = `UPDATE ${tableName} SET ${updateSql} WHERE id=?`;

    try {
        const result = await new Promise((resolve, reject) => {
            db.query(sqlQuery, [...values, values[values.length - 1]], (error, result) => {
                if (error) {
                    console.error(error);
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });

        if (result.affectedRows > 0) {
            return true;
        } else {
            console.log(`Row not found`);
            return false;
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
        return false;
    }
};

app.put('/api/edit/orders', async (req, res) => {
    const { updatedRows } = req.body;

    try {
        for (const updatedRow of updatedRows) {
            const updateSql = 'price=?, quantity=?, product_name=?, units=?, date=?, customer=?';
            const updateValues = [updatedRow.price, updatedRow.quantity, updatedRow.product_name, updatedRow.units, updatedRow.date, updatedRow.customer, updatedRow.id];

            const success = await updateRows('orders', updateSql, updateValues, res);

            if (!success) {
                console.log(`Failed`);
            }
        }

        res.status(200).json({ success: true, message: 'Məlumatlar yeniləndi' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'error' });
    }
});

app.put('/api/edit/kontragent', async (req, res) => {
    const { updatedRows } = req.body;
    try {
        for (const updatedRow of updatedRows) {
            const updateSql = `name=?, phone_number=?, tin=?, address=?, type=?`;
            const updateValues = [updatedRow.name, updatedRow.phone_number, updatedRow.tin, updatedRow.address, updatedRow.type, updatedRow.id];

            const success = await updateRows('kontragent', updateSql, updateValues, res);
            if (!success) {
                console.log(`Failed`);
            }
        }

        res.status(200).json({ success: true, message: 'Məlumatlar yeniləndi' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'error' });
    }
})

app.put('/api/edit/products', (req, res) => {
    const { updatedRows } = req.body;

    try {
        let nameExists = false;

        const checkAndUpdate = (updatedData) => {
            const { id, name } = updatedData;

            const selectSql = 'SELECT * FROM products WHERE name = ?';
            const selectValues = [name];

            db.query(selectSql, selectValues, (selectErr, selectResult) => {
                if (selectErr) {
                    console.error(selectErr);
                    res.status(500).json({ success: false, message: 'error' });
                } else {
                    if (selectResult.length > 0) {
                        nameExists = true;
                    } else {
                        nameExists = false;
                        const updateSql = 'UPDATE products SET name = ? WHERE id = ?';
                        const updateValues = [name, id];

                        db.query(updateSql, updateValues, (updateErr, updateResult) => {
                            if (updateErr) {
                                console.error(updateErr);
                                res.status(500).json({ success: false, message: 'error' });
                            }
                        });
                    }
                }
            });
        };

        for (const updatedData of updatedRows) {
            checkAndUpdate(updatedData);
        }

        if (!nameExists) {
            res.status(200).json({ success: true, message: 'Məlumatlar yeniləndi' });
        } else {
            res.status(400).json({ success: false, message: 'Məlumat artıq var' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'error' });
    }
});

app.put('/api/invoice', async (req, res) => {
    const { newRows, date, customer, number } = req.body;
    console.log("salam");
    if (Array.isArray(newRows)) {
        try {
            let totalAffectedRows = 0;
            let updatedIds = [];

            const updatePromises = newRows.map(async (updatedRow) => {
                const updateSql = `UPDATE invoice SET quantity=?, price=?, product_name=?, date=?, customer=?, number=? WHERE id=?`;
                const updateValues = [updatedRow.quantity, updatedRow.price, updatedRow.product_name, date, customer, number, updatedRow.id];

                try {
                    const result = await db.query(updateSql, updateValues);
                    totalAffectedRows += result.affectedRows;
                    updatedIds.push(updatedRow.id);


                    const otherTableUpdateSql = `UPDATE nomenklatura SET name=?, price=? WHERE invoice_id = ?`;
                    const otherTableUpdateValues = [updatedRow.product_name, updatedRow.price];

                    const otherTableResult = await db.query(otherTableUpdateSql, [...otherTableUpdateValues, updatedRow.id]);

                } catch (error) {
                    console.error(error);
                    throw error;
                }
            });

            await Promise.all(updatePromises);

            if (totalAffectedRows > 0) {
                res.status(404).json({ success: false, message: 'not found' });
            } else {
                res.status(200).json({ success: true, message: 'Məlumat yeniləndi' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'error' });
        }
    } else {
        res.status(500).json({ error: 'error' });
    }
});

app.delete('/api/delete/:id/:tableName', (req, res) => {
    const { id, tableName } = req.params;
    const idArray = id.split(',').map(Number);
    const placeholders = idArray.map(() => '?').join(',');

    const deleteSql = `DELETE FROM ${tableName} WHERE id IN (${placeholders})`;

    db.query(deleteSql, idArray, (error, result) => {
        if (error) {
            console.error(error);
            res.status(500).json({ error: 'error' });
        } else {
            res.status(200).json({ message: 'Məlumat silindi' });
        }
    });
});

app.listen(PORT, () => { console.log(`http://192.168.88.11:${PORT}`) }); ``