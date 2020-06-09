// app.js
const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const connection = require('./connection');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.get('/', (req, res) => {
    res.status(200).json({ message: "Hello World!" });
});


app.get('/bookmark/:id', (req, res) => {
    const idBookmark = req.params.id;
    connection.query('SELECT * FROM bookmark WHERE id = ?', [idBookmark], (err, results) => {
        if (err) {
            res.status(500).json({
                error: err.message,
                sql: err.sql
            });
        }
        else if (results.length === 0) {
            res.status(404).json({ "error": "Bookmark not found" });
        }
        else {
            res.status(200).json(results[0]);
        }
    });
});


app.post('/bookmark', (req, res) => {
    const { url, title } = req.body;
    const insertId = req.params.id;

    if (!url || !title) {
        return res.status(422).json({ error: 'required field(s) missing' });
    };

    connection.query('INSERT INTO bookmark SET ?', [req.body], (err, stats) => {
        if (err) {
            res.status(500).json({
                error: err.message,
                sql: err.sql
            });
        }
        else {
            connection.query('SELECT * FROM bookmark WHERE id = ?', [stats.insertId], (err2, records) => {
                if (err2) {
                    res.status(500).json({
                        error: err2.message,
                        sql: err2.sql
                    })
                }
                else {
                    res.status(201).json(records[0]);
                }
            });
        }
    });
});

module.exports = app;