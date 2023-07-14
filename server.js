const express = require("express");
require("dotenv").config();
const session = require("express-session");

// Import routes
const cartRoutes = require("./routes/cart");
const adminRoutes = require("./routes/admin");
const apiRoutes = require("./routes/api");

// Import methods.
const sendEmail = require("./methods/sendEmail");
const {
    getUsers,
    getUser,
    checkUser,
    getUserByEmail,
} = require("./methods/getUsers");
const { addUser, setUser } = require("./methods/setUsers");
const { getProducts, getNumberOfProducts } = require("./methods/getProducts");
const generateToken = require("./methods/generateToken");
const checkAuth = require("./middleware/checkAuth");

const app = express();
const port = process.env.PORT;

// Set the view engine to ejs
app.set("view engine", "ejs");

// Serve static assets (CSS, images, etc.) from the "public" folder.
app.use(express.static("public"));

// Use sessions to keep track of the user's login status.
app.use(
    session({
        secret: "secret key",
        resave: false,
        saveUninitialized: false,
    })
);

// Parse incoming form submissions.
app.use(express.urlencoded({ extended: true }));
app.use(express.static("uploads"));
app.use(express.json());

// Use routes
app.use("/cart", cartRoutes);
app.use("/admin", adminRoutes);
app.use("/api", checkAuth.isAdmin, apiRoutes);

app.get("/", (req, res) => {
    if (req.session.isLoggedIn) {
        res.render("index", {
            username: req.session.name,
            email: req.session.email,
        });
    } else {
        res.render("index");
    }
});

app.route("/login")
    .get(checkAuth.checkLoggedOut, (req, res) => {
        res.render("login");
    })
    .post(async (req, res) => {
        const { email, password } = req.body;

        // Check whether email and password are entered
        if (!email || !password) {
            res.render("login", {
                errorMessage: "Please enter email and password",
            });
            return;
        }

        // Check whether user exists
        const user = await getUser(email, password);
        if (user.length !== 0) {
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
                if (user.isAdmin) {
                    req.session.isAdmin = true;
                    res.redirect("/admin");
                } else {
                    res.redirect("/");
                }
                return;
            }
        } else {
            res.render("login", {
                errorMessage: "Invalid email or password",
            });
        }
    });

app.route("/signUp")
    .get(checkAuth.checkLoggedOut, (req, res) => {
        res.render("signUp");
    })
    .post(async (req, res) => {
        const { name, mobile, email, password } = req.body;
        if (!name || !mobile || !email || !password) {
            res.render("signUp", {
                errorMessage: "Please enter all the fields",
            });
            return;
        }

        const user = {
            name,
            mobile,
            email,
            password,
            emailVerification: {
                isEmailVerified: 0,
                verificationCode: generateToken(),
            },
        };

        // Check if user already exists
        const userExists = await checkUser(email);
        if (userExists) {
            res.render("signUp", {
                errorMessage: "User already exists",
            });
            return;
        }

        await addUser(user);
        res.sendFile(__dirname + "/public/verifyEmail.html");

        // Send email verification link
        const subject = "Email Verification";
        const textPart = `Greetings from E-commerce.`;
        const htmlPart =
            "<h3>Please verify your email by clicking on the link below</h3>" +
            '<br/><a href="http://localhost:' +
            port +
            "/verifyEmail?token=" +
            user.emailVerification.verificationCode +
            '">Verify</a>';
        // sendEmail(email, subject, textPart, htmlPart);
    });

app.get("/logout", checkAuth.checkLoggedIn, (req, res) => {
    req.session.destroy();
    res.redirect("/");
});

app.post("/products", async (req, res) => {
    const { from } = req.body;
    const products = await getProducts(from);
    const numberOfProducts = await getNumberOfProducts();
    res.send({ products, numberOfProducts });
});

app.get("/verifyEmail", checkAuth.checkLoggedOut, async (req, res) => {
    const token = req.query.token;
    console.log(token);

    // if token is not given, redirect to 404 page
    if (!token) {
        res.status(404).redirect("*");
        return;
    }

    // get all users
    const users = await getUsers();
    for (let user of users) {
        // if user's verification code matches the token and user's email is not verified
        if (
            user.emailVerification.verificationCode === token &&
            !user.emailVerification.isEmailVerified
        ) {
            // mark user's email as verified
            user.emailVerification.isEmailVerified = 1;
            await setUser(user);

            // set session variables
            req.session.isLoggedIn = true;
            req.session.name = user.name;
            req.session.email = user.email;

            // redirect to home page
            res.redirect("/");
            return;
        }
    }
    // if user is not found, redirect to 404 page
    res.status(404).redirect("*");
});

app.route("/changePassword")
    .get(checkAuth.checkLoggedIn, (req, res) => {
        res.render("changePassword");
    })
    .post(async (req, res) => {
        const { oldPassword, newPassword, confirmPassword } = req.body;
        if (!oldPassword || !newPassword || !confirmPassword) {
            res.render("changePassword", {
                errorMessage: "Please enter all the fields",
            });
            return;
        }
        const email = req.session.email;
        if (newPassword !== confirmPassword) {
            res.render("changePassword", {
                errorMessage: "Confirm password do not match",
            });
            return;
        }

        const user = await getUser(email, oldPassword);
        if (user.length === 0) {
            res.render("changePassword", {
                errorMessage: "Invalid old password",
            });
            return;
        }

        if (user.password === newPassword) {
            res.render("changePassword", {
                errorMessage: "New password cannot be same",
            });
            return;
        }
        user.password = newPassword;
        await setUser(user);
        res.redirect("/logout");
        // send a email to user that password has been changed
        // sendEmail(
        //     user.email,
        //     "Password Changed",
        //     "You have just changed your Password",
        //     ""
        // );
        return;
    });

app.route("/forgotPassword")
    .get(checkAuth.checkLoggedOut, (req, res) => {
        res.render("forgotPassword");
    })
    .post(async (req, res) => {
        const { email } = req.body;
        if (!email) {
            res.render("forgotPassword", {
                errorMessage: "Please enter an email",
            });
            return;
        }

        const user = await getUserByEmail(email);
        if (user.length !== 0) {
            res.render("forgotPassword", {
                errorMessage: "Password reset link sent to your email",
            });

            const subject = "Password Reset";
            const textPart = `Greetings from E-commerce.`;
            const htmlPart =
                "<h3>Please reset your password by clicking on the link below</h3>" +
                '<br/><a href="http://localhost:' +
                port +
                "/resetPassword?token=" +
                user.emailVerification.verificationCode +
                '">Reset Password</a>';
            // sendEmail(email, subject, textPart, htmlPart);
            return;
        } else {
            res.render("forgotPassword", {
                errorMessage: "User does not exist",
            });
        }
    });

app.route("/resetPassword")
    .get(checkAuth.checkLoggedOut, async (req, res) => {
        const token = req.query.token;
        if (!token) {
            res.status(404).redirect("*");
            return;
        }

        const users = await getUsers();
        for (let user of users) {
            if (
                user.emailVerification.verificationCode.toString() === token &&
                user.emailVerification.isEmailVerified === 1
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

        if (!newPassword || !confirmPassword) {
            res.render("resetPassword", {
                errorMessage: "Please enter all the fields",
            });
            return;
        }

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
                user.emailVerification.verificationCode = generateToken();
                await setUser(user);
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

app.listen(port);
