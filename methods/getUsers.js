let db = require("./db.js");

function getUser(email, password) {
    return new Promise((resolve, reject) => {
        db(
            "SELECT * FROM users WHERE email='" +
                email +
                "' AND password='" +
                password +
                "'"
        )
            .then((result) => {
                if (result.length == 0) {
                    resolve([]);
                }
                let user = {
                    name: result[0].name,
                    email: result[0].email,
                    password: result[0].password,
                    mobile: result[0].mobile,
                    emailVerification: {
                        isEmailVerified: result[0].isVerified,
                        verificationCode: result[0].verificationCode,
                    },
                    isAdmin: result[0].isAdmin,
                };
                resolve(user);
            })
            .catch((err) => {
                reject(err);
            });
    });
}

function checkUser(email) {
    return new Promise((resolve, reject) => {
        db("SELECT * FROM users WHERE email='" + email + "'")
            .then((result) => {
                if (result.length == 0) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            })
            .catch((err) => {
                reject(err);
            });
    });
}

function getUsers() {
    return new Promise((resolve, reject) => {
        db("SELECT * FROM users")
            .then((result) => {
                let users = [];
                for (let i = 0; i < result.length; i++) {
                    let user = {
                        name: result[i].name,
                        email: result[i].email,
                        password: result[i].password,
                        mobile: result[i].mobile,
                        emailVerification: {
                            isEmailVerified: result[i].isVerified,
                            verificationCode: result[i].verificationCode,
                        },
                        isAdmin: result[i].isAdmin,
                    };
                    users.push(user);
                }
                resolve(users);
            })
            .catch((err) => {
                reject(err);
            });
    });
}

function getUserByEmail(email) {
    return new Promise((resolve, reject) => {
        db("SELECT * FROM users WHERE email='" + email + "'")
            .then((result) => {
                if (result.length == 0) {
                    resolve([]);
                }
                let user = {
                    name: result[0].name,
                    email: result[0].email,
                    password: result[0].password,
                    mobile: result[0].mobile,
                    emailVerification: {
                        isEmailVerified: result[0].isVerified,
                        verificationCode: result[0].verificationCode,
                    },
                };
                resolve(user);
            })
            .catch((err) => {
                reject(err);
            });
    });
}

module.exports = { getUser, getUsers, checkUser, getUserByEmail };
