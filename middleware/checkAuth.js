function checkLoggedIn(req, res, next) {
    if (req.session.isLoggedIn) {
        next();
    } else {
        res.render("login", {
            errorMessage: "You must be logged in to access this page"
        });
    }
}

function checkLoggedOut(req, res, next) {
    if (req.session.isLoggedIn) {
        res.redirect("/");
    } else {
        next();
    }
}

function isAdmin(req, res, next) {
    if (req.session.isAdmin) {
        next();
    } else {
        res.render("login", {
            errorMessage: "You are not authorized to access this page"
        });
    }
}

module.exports = { checkLoggedIn, checkLoggedOut, isAdmin };
