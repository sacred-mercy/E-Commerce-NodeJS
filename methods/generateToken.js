function generateToken () {
    let chars =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let token = "";
    for (let i = 0; i < 50; i++) {
        token += chars[Math.floor(Math.random() * chars.length)];
    }
    return token;
};

module.exports = generateToken;