exports.sendMail = function (subject, message, to) {
    // email account data
    var nodemailer = require('nodemailer');
    var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                    user: 'mrbitja@gmail.com',
                    pass: 'mrbitne7777777'
            }
    });

    // mail body
    var subject;
    var message;
    var to;
    var mailOptions = {
            from: 'bb@gmail.com',   //NOT WORK
            to: 'markosmid333@gmail.com',//to, 
            subject: subject, //'You have got mail',
            text: message
    };

    // response
    transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                    console.log(error);
            } else {
                    //console.log('Email sent: ' + info.response);
                    console.log("Email sent at: " + f.getTime() + " To: " + mailOptions.to + " Subject: " + subject);
            }
    });
}
//sendMail("Run!","Started at:"+f.getTime());
