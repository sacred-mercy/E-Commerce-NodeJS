const express = require("express");
const fs = require("fs");
const session = require("express-session");
const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(
    session({
        secret: "secret key",
        resave: false,
        saveUninitialized: false,
    })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
    if (req.session.isLoggedIn) {
        res.render("index", { username: req.session.name });
    } else {
        res.render("index");
    }
});

app.route("/login")
    .get((req, res) => res.render("login"))
    .post((req, res) => {
        if (req.session.isLoggedIn) {
            res.redirect("/");
            return;
        }
        console.log(req.body);
        const { email, password } = req.body;
        fs.readFile("database/users.json", (err, data) => {
            if (err) {
                res.render("login", {
                    errorMessage: "Invalid email or password",
                });
                return;
            }
            const users = JSON.parse(data);
            for (let user of users) {
                if (user.email === email && user.password === password) {
                    req.session.isLoggedIn = true;
                    req.session.name = user.name;
                    req.session.email = email;
                    res.redirect("/");
                    return;
                }
            }
            res.render("login", {
                errorMessage: "Invalid email or password",
            });
        });
    });

app.route("/signUp")
    .get((req, res) => res.render("signUp"))
    .post((req, res) => {
        const { name, mobile, email, password } = req.body;
        const user = {
            name,
            mobile,
            email,
            password,
            isEmailVerified: false,
        };

        fs.readFile("database/users.json", (err, data) => {
            if (err) {
                res.render("signUp", {
                    errorMessage: "Invalid email or password",
                });
            }
            const users = JSON.parse(data);

            // Check if user already exists
            for (let user of users) {
                if (user.email === email) {
                    res.render("signUp", {
                        errorMessage: "User already exists",
                    });
                    return;
                }
            }

            users.push(user);
            fs.writeFile(
                "database/users.json",
                JSON.stringify(users),
                (err) => {
                    if (err) {
                        res.render("login", {
                            errorMessage: "Invalid email or password",
                        });
                    }
                    console.log("Data written to file");
                    res.redirect("/login");
                }
            );
        });
    });

app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
});

app.get("/products", (req, res) => {
    fs.readFile("database/products.json", (err, data) => {
        if (err) {
            res.status(500).send("Internal Server Error");
            return;
        }
        res.send(data);
    });
});

app.route("*").get((req, res) => res.render("404"));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
