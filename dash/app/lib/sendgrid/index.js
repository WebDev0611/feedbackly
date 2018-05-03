var helper = require('sendgrid').mail
var sendgrid = require('sendgrid')(process.env.SENDGRID_API_KEY);
var _ = require('lodash')

function createMail(data, substitutions, addresses) {

    var mail = new helper.Mail();
    var email = new helper.Email(data.fromEmail, data.fromName)
    mail.setFrom(email)
    if (data.subject) mail.setSubject(data.subject);

    _.forEach(addresses, a => {
        var personalization = createPersonalization(a, substitutions)
        mail.addPersonalization(personalization);
    })

    mail.setTemplateId(data.templateId);

    return mail.toJSON();
}

function createPersonalization(address, substitutions) {

    // address = {email: "j@j.com", name: "Jonas"}

    var personalization = new helper.Personalization();
    var email = new helper.Email(address.email, address.name)
    personalization.addTo(email)

    _.forEach(substitutions, (val, key) => {
        console.log(val, key)
        personalization.addSubstitution(new helper.Substitution(key, val))
    })

    return personalization;
}

function sendFromGrid(toSend) {
    var requestBody = toSend
    var emptyRequest = require('sendgrid-rest').request
    var requestPost = JSON.parse(JSON.stringify(emptyRequest))

    requestPost.method = 'POST'
    requestPost.path = '/v3/mail/send'
    requestPost.body = requestBody

    return sendgrid.API(requestPost);
}

function sendEmail(data, substitutions, addresses) {
    // data: {fromEmail: "j@j", fromName: "Feedbackly", subject: "spröllölöl", templateId: "8fshds-isodfisdj-sidfjdis"}
    // substitutions = {"{{link}}": "google.fi" }

    var toSend = createMail(data, substitutions, addresses);
    return sendFromGrid(toSend);
}

function sendPlainEmail(to, from, subject, body) {
    const request = sendgrid.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: {
            personalizations: [
                {
                    to: [
                        {
                            email: to
                        },
                        {
                            email: 'example@gmail.com'
                        }
                    ],
                    subject: subject
                }
            ],
            from: {
                email: from
            },
            content: [
                {
                    type: 'text/plain',
                    value: body
                }
            ]
        }
    });

// // With promise
    sendgrid.API(request)
        .then(function (response) {
            console.log('success')
            console.log(response.statusCode);
            console.log(response.body);
            console.log(response.headers);
        })
        .catch(function (error) {
            // error is an instance of SendGridError
            // The full response is attached to error.response
            console.log(error.response.statusCode);
        });

}
module.exports = {sendEmail, sendPlainEmail}
