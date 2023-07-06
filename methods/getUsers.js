// a module to get users from the database
// Parameters: none
// Returns: a  json object with all the users
// Dependencies: none
let fs = require("fs");
let fileName = "database/users.json";

function getUsers() {
    return new Promise((resolve, reject) => {
        fs.readFile(fileName, "utf8", function (err, data) {
            if (err) reject(err);
            resolve(JSON.parse(data));
        });
    });
}

module.exports = getUsers;
