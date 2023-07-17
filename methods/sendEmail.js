require("dotenv").config();
const Mailjet = require("node-mailjet");
const mailjet = Mailjet.apiConnect(
    process.env.MJ_APIKEY_PUBLIC,
    process.env.MJ_APIKEY_PRIVATE
);

module.exports = (email, subject, textPart, htmlPart, callback) => {
    const request = mailjet.post("send", { version: "v3.1" }).request({
        Messages: [
            {
                From: {
                    Email: "nish63348@gmail.com",
                    Name: "E-Commerce",
                },
                To: [
                    {
                        Email: email,
                        Name: "You",
                    },
                ],
                Subject: subject,
                TextPart: textPart,
                HTMLPart: htmlPart,
            },
        ],
    });
    request
        .then((result) => {
            console.log(result.body);
            // callback(null, result.body);
        })
        .catch((err) => {
            console.log(err.statusCode);
            console.log(err.originalMessage);
            // callback(err, null);
        });
};
