/**
 * Digest mailer
 */
'use strict';

var auth = require('../lib/auth');
var nodemailer = require('nodemailer');
var mailBody = require('../lib/mailbody');

var Mailer = function() {

	var self = this;

	this.body = '';

	this.filePath = null;

	this.user;

	this.sendFileTo = function(user){
            self.user = user;
            console.log('send digest mail to', user.email);
            var attachment = {
                path: self.filePath,
                cid: self.user.email //same cid value as in the html img src
            };

            sendEmail(
                'Tapin.fi <digest@tapin.fi>',
                 //self.user.email,
                 'joonas.hamunen@tapin.fi',
                 'Tapin weekly digest',
                 mailBody.render(self.body, self.user),
                 mailBody.renderHTML(self.body, self.user),
                 attachment
            );

            return user;
	};

        this.sendPasswordReset = function(params) {
            var emailBody = '<p>Salasananne on vaihdettavissa tämän linkin takana:</p>';
						emailBody+= ('<p><a href="' + params.link + '">' + params.link + '</a></p>');
            emailBody+= "<p>Mikäli salasanan vaihdon kanssa ilmenee ongelmia, ottakaa yhteys tukeemme support@tapin.fi.</p>";
            emailBody+= "</p>Terveisin, \nTapin feedback -tiimi</p>";
            sendEmail(
                'Tapin feedback <support@tapin.fi>',
                params.email,
                'Uusi salasananne',
								'',
                emailBody
            );

        };

        this.sendSupportRequest = function(user, question) {

            var emailBody = 'Id: '+ user._id + '\n';
                emailBody += 'Nimi: '+ user.displayname + '\n';
                emailBody += 'Email: '+ user.email + '\n';
                emailBody += 'Kysymys:\n';
                emailBody += question;

            sendEmail(
                'Tuki <mailer@tapin.fi>',
                'support@tapin.fi',
                'Tukikysymys',
                emailBody
            );
        };

        this.sendSurvey = function(campaign, address, cb){
            sendEmail(campaign.senderName + '<' + campaign.senderEmail + '>', address, campaign.subject, null, campaign.html, null, cb);
        }
        
        
	
	// PRIVATE METHODS
	var transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'mailer@tapin.fi',
                pass: '__m4il3r<<_'
            }
	});
        
	var sendEmail = function(from, to, subject, textBody, htmlBody, attachments, cb)  {
            var mailOptions = {
                from: from,
                to: to, 
                subject: subject, 
                text: textBody						
            }; 
            if(htmlBody) {
                mailOptions.html = htmlBody;
            }
            if(attachments) {
                mailOptions.attachments = attachments;
            }
            transporter.sendMail(mailOptions, function(error, info){
                if(error){
                    console.log(error);
                    if(cb) cb(error)
                }else{
                    console.log('Message sent: ' + info.response);
                    if(cb) cb();
                }
            });
        };

	return this;
};

module.exports = new Mailer();
