require("dotenv").config();
const { DB_HOST, DB_USER, DB_PASS, DB_PORT, DB_NAME } = process.env;
let mysql = require("mysql");

let con = mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASS,
    port: DB_PORT,
    database: DB_NAME,
});

function dbQuery(query) {
    return new Promise((resolve, reject) => {
        con.query(query, function (err, result) {
            if (err) reject(err);
            resolve(result);
        });
    });
}

module.exports = dbQuery;