const express = require("express");
const fs = require("fs");
require("dotenv").config();
const session = require("express-session");

const sendEmail = require("./methods/sendEmail");
const getUsers = require("./methods/getUsers");
const setUsers = require("./methods/setUsers");

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
    .post(async (req, res) => {
        if (req.session.isLoggedIn) {
            res.redirect("/");
            return;
        }
        console.log(req.body);
        const { email, password } = req.body;
        const users = await getUsers();

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

app.route("/signUp")
    .get((req, res) => res.render("signUp"))
    .post(async (req, res) => {
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

        const users = await getUsers();

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
        await setUsers(users);
        res.sendFile(__dirname + "/public/verifyEmail.html");

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
        // sendEmail(email, subject, textPart, htmlPart);
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

app.get("/verifyEmail", async (req, res) => {
    const token = req.query.token;
    console.log(token);

    const users = await getUsers();

    for (let user of users) {
        if (
            user.emailVerification.verificationCode === token &&
            !user.emailVerification.isEmailVerified
        ) {
            user.emailVerification.isEmailVerified = true;
            await setUsers(users);
            req.session.isLoggedIn = true;
            req.session.name = user.name;
            req.session.email = user.email;
            res.redirect("/");
            return;
        }
    }
    res.status(404).redirect("*");
});

app.route("/changePassword")
    .get((req, res) => {
        if (!req.session.isLoggedIn) {
            res.redirect("/login");
            return;
        }
        res.render("changePassword");
    })
    .post(async (req, res) => {
        const { newPassword, confirmPassword } = req.body;
        if (newPassword !== confirmPassword) {
            res.render("changePassword", {
                errorMessage: "Confirm password do not match",
            });
            return;
        }

        const users = await getUsers();
        for (let user of users) {
            if (user.email === req.session.email) {
                if (user.password === newPassword) {
                    res.render("changePassword", {
                        errorMessage: "New password cannot be same",
                    });
                    return;
                }
                user.password = newPassword;
                await setUsers(users);
                res.redirect("/logout");
                // send a email to user that password has been changed
                // sendEmail(
                //     user.email,
                //     "Password Changed",
                //     "You have just changed your Password",
                //     ""
                // );
                return;
            }
        }
    });

app.route("/forgotPassword")
    .get((req, res) => res.render("forgotPassword"))
    .post(async (req, res) => {
        const { email } = req.body;

        const users = await getUsers();
        for (let user of users) {
            if (user.email === email) {
                const subject = "Password Reset";
                const textPart = `Greetings from E-commerce.`;
                const htmlPart =
                    "<h3>Please reset your password by clicking on the link below</h3>" +
                    '<br/><a href="http://localhost:' +
                    process.env.PORT +
                    "/resetPassword?token=" +
                    user.emailVerification.verificationCode +
                    '">Reset Password</a>';

                res.render("forgotPassword", {
                    errorMessage: "Password reset link sent to your email",
                });

                // sendEmail(email, subject, textPart, htmlPart);
                return;
            }
        }
        res.render("forgotPassword", {
            errorMessage: "User does not exist",
        });
    });

app.route("/resetPassword")
    .get(async (req, res) => {
        const token = req.query.token;

        const users = await getUsers();
        for (let user of users) {
            if (
                user.emailVerification.verificationCode.toString() === token &&
                user.emailVerification.isEmailVerified
            ) {
                req.session.email = user.email;
                res.render("resetPassword");
                return;
            }
        }
        res.status(404).redirect("*");
    })
    .post(async (req, res) => {
        const { newPassword, confirmPassword } = req.body;
        if (newPassword !== confirmPassword) {
            res.render("resetPassword", {
                errorMessage: "Confirm password do not match",
            });
            return;
        }

        const users = await getUsers();
        for (let user of users) {
            if (user.email === req.session.email) {
                if (user.password === newPassword) {
                    res.render("resetPassword", {
                        errorMessage: "New password cannot be same",
                    });
                    return;
                }
                user.password = newPassword;
                await setUsers(users);
                res.redirect("/logout");
                // send a email to user that password has been changed
                // sendEmail(
                //     user.email,
                //     "Password Changed",
                //     "You have just changed your Password",
                //     ""
                // );
                return;
            }
        }
    });

app.route("*").get((req, res) => res.sendFile(__dirname + "/public/404.html"));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
