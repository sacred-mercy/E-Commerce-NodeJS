let fs = require("fs");
let fileName = "database/users.json";

function setUsers(data){
    return new Promise((resolve, reject) => {
        fs.writeFile(fileName, JSON.stringify(data), function (err) {
            if (err) reject(err);
            resolve("Success");
        });
    } );
}

module.exports = setUsers;