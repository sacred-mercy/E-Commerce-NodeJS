const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    if (!req.session.isLoggedIn) {
        res.redirect("/login");
        return;
    }
    if (!req.session.isAdmin) {
        res.render("admin", {
            error : true,
        });
        return;
    }

    res.render("admin", {
        username: req.session.name,
        error: false,
    });
});

module.exports = router;
