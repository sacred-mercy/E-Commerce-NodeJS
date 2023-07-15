function generateToken () {
    let chars =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let token = "";
    for (let i = 0; i < 255; i++) {
        token += chars[Math.floor(Math.random() * chars.length)];
    }
    console.log(`Token generated: ${token}`);
    return token;
};

module.exports = generateToken;