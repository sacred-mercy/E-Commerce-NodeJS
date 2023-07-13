function checkLoggedIn(req, res, next) {
    if (req.session.isLoggedIn) {
        next();
    } else {
        res.redirect("/login");
    }
}

function checkLoggedOut(req, res, next) {
    if (req.session.isLoggedIn) {
        res.redirect("/");
    } else {
        next();
    }
}

module.exports = { checkLoggedIn, checkLoggedOut };