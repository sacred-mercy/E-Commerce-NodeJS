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

app.get("/", (req, res) => res.render("index"));

app.route("/login")
    .get((req, res) => res.render("login"))
    .post((req, res) => {
        const { email, password } = req.body;
        fs.readFile("database/users.json", (err, data) => {
            if (err) throw err;
            const users = JSON.parse(data);
            for (let user of users) {
                if (user.email === email && user.password === password) {
                    req.session.name = user.name;
                    req.session.email = email;
                    res.redirect("/home");
                }
            }
            res.redirect("/login");
        });
    });

app.route("/signUp")
    .get((req, res) => res.render("signUp"))
    .post((req, res) => {
        console.log(req.body);
        const { name, mobile, email, password } = req.body;
        const user = {
            name: name,
            mobile: mobile,
            email: email,
            password: password,
        };
        fs.readFile("database/users.json", (err, data) => {
            if (err) throw err;
            const users = JSON.parse(data);
            users.push(user);
            fs.writeFile(
                "database/users.json",
                JSON.stringify(users),
                (err) => {
                    if (err) throw err;
                    console.log("Data written to file");
                    res.redirect("/login");
                }
            );
        });
    });

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
