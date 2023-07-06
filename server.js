const express = require("express");
const fs = require("fs");
require("dotenv").config();
const session = require("express-session");

const sendEmail = require("./methods/sendEmail");

const app = express();
const port = process.env.PORT;

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
                    // check if email is verified
                    if (!user.emailVerification.isEmailVerified) {
                        res.render("login", {
                            errorMessage: "Email not verified",
                        });
                        return;
                    }
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
            emailVerification: {
                isEmailVerified: false,
                verificationCode: Date.now(),
            },
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

            // Send email verification link
            const subject = "Email Verification";
            const textPart = `Greetings from E-commerce.`;
            const htmlPart =
                "<h3>Please verify your email by clicking on the link below</h3>" +
                '<br/><a href="http://localhost:' +
                process.env.PORT +
                "/verifyEmail?token=" +
                token +
                '">Verify</a>';
            sendEmail(email, subject, textPart, htmlPart, (err, data) => {
                if (err) {
                    res.render("signUp", {
                        errorMessage: "Invalid email or password",
                    });
                    return;
                }
                console.log(data);
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

app.get("/verifyEmail", (req, res) => {
    const token = req.query.token;
    console.log(token);
    fs.readFile("database/users.json", (err, data) => {
        if (err) {
            res.status(500).send("Internal Server Error");
            return;
        }
        const users = JSON.parse(data);
        for (let user of users) {
            if (
                user.emailVerification.verificationCode.toString() === token &&
                !user.emailVerification.isEmailVerified
            ) {
                user.emailVerification.isEmailVerified = true;
                fs.writeFile(
                    "database/users.json",
                    JSON.stringify(users),
                    (err) => {
                        if (err) {
                            res.status(500).send("Internal Server Error");
                            return;
                        }
                        req.session.isLoggedIn = true;
                        req.session.name = user.name;
                        req.session.email = user.email;
                        res.redirect("/");
                    }
                );
                return;
            }
        }
        res.status(404).redirect("*");
    });
});

app.route("/changePassword")
    .get((req, res) => {
        if (!req.session.isLoggedIn) {
            res.redirect("/login");
            return;
        }
        res.render("changePassword");
    })
    .post((req, res) => {
        const { newPassword, confirmPassword } = req.body;
        if (newPassword !== confirmPassword) {
            res.render("changePassword", {
                errorMessage: "Confirm password do not match",
            });
            return;
        }
        fs.readFile("database/users.json", (err, data) => {
            if (err) {
                res.status(500).send("Internal Server Error");
                return;
            }
            const users = JSON.parse(data);
            for (let user of users) {
                if (user.email === req.session.email) {
                    if (user.password === newPassword) {
                        res.render("changePassword", {
                            errorMessage: "New password cannot be same",
                        });
                        return;
                    }
                    user.password = newPassword;
                    fs.writeFile(
                        "database/users.json",
                        JSON.stringify(users),
                        (err) => {
                            if (err) {
                                res.status(500).send("Internal Server Error");
                                return;
                            }
                            res.redirect("/logout");
                            // send a email to user that password has been changed
                            sendEmail(
                                user.email,
                                "Password Changed",
                                "You have just changed your Password",
                                ""
                            );
                        }
                    );
                    return;
                }
            }
        });
    });

app.route("/forgotPassword")
    .get((req, res) => res.render("forgotPassword"))

app.route("*").get((req, res) => res.sendFile(__dirname + "/public/404.html"));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
