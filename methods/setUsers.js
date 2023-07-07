let db = require("./db.js");

function addUser(userDetail) {
    return new Promise((resolve, reject) => {
        db(
            `INSERT INTO users (name, email, password, mobile, isVerified, verificationCode)`+ 
            `VALUES ('${userDetail.name}', '${userDetail.email}', '${userDetail.password}',`+
            `'${userDetail.mobile}', '${userDetail.emailVerification.isEmailVerified}',`+
            `'${userDetail.emailVerification.verificationCode}')`
        )
            .then((result) => {
                resolve(result);
            })
            .catch((err) => {
                reject(err);
            });
    });
}

function setUser(userDetail) {
    return new Promise((resolve, reject) => {
        db(
            `UPDATE users SET name='${userDetail.name}', password='${userDetail.password}',`+
            `mobile='${userDetail.mobile}', isVerified='${userDetail.emailVerification.isEmailVerified}',`+
            `verificationCode='${userDetail.emailVerification.verificationCode}' WHERE email='${userDetail.email}'`
        )
            .then((result) => {
                resolve(result);
            })
            .catch((err) => {
                reject(err);
            });
    });
}

module.exports = { addUser, setUser };
