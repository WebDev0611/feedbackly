var mailer = require("../lib/sendgrid");
var cors = require("cors");

var sg = require('sendgrid')(process.env.SENDGRID_API_KEY);
var emailTemplate = "541433c3-ef06-4633-97fc-0ca5469730a1";

async function post(req, res) {
    const {name, toEmail, link, myEmail} = req.body;
    if (!name || !link || !toEmail || !myEmail)
        return res.status(400).json({error: "Missing fields. Check your input."});

    try {

        const subject = name + ' ' + 'has invited you to sign up to Feedbackly!'
        const body = 'Hey there!' + '\r\n\r\n' +
            name + ' ' + 'has invited you to sign up to Feedbackly! Enjoy €10 off any of our paid' +
            ' ' + 'subscriptions by following this link:' + ' ' + link + '\r\n\r\n' +
            'With Feedbackly, you can create surveys, publish them on our iPad app, your website, or with any one of our many integrations.' +
            '   ' + 'Then check your feedback with our industry - leading advanced analytics dashboard.'
        await mailer.sendPlainEmail(toEmail, myEmail, subject, body)
        res.json({ok: "true"});
    } catch (e) {
        console.log(e);
        res.status(500).json({error: "Something went wrong"});
    }

}


module.exports = {post};