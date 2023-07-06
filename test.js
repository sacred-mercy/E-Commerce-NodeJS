var nodemailer = require("nodemailer");

// Create the transporter with the required configuration for Gmail
// change the user and pass !
var transporter = nodemailer.createTransport({
    host: "smtp.zoho.com",
    port: 465,
    secure: true, // use SSL
    auth: {
        user: "gauravsingh96@zohomail.in",
        pass: "iKbfNVtPzY4T",
    },
});

// setup e-mail data, even with unicode symbols
var mailOptions = {
    from: '"Our Code World " <gauravsingh96@zohomail.in>', // sender address (who sends)
    to: "gauravnegi9634@gmail.com", // list of receivers (who receives)
    subject: "Hello ", // Subject line
    text: "Hello world ", // plaintext body
    html: "<b>Hello world </b><br> This is the first email sent with Nodemailer in Node.js", // html body
};

// send mail with defined transport object
transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
        return console.log(error);
    }

    console.log("Message sent: " + info.response);
});
