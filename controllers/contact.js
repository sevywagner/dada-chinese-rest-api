const { createTransport } = require('nodemailer')

const transport = createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'jingyi.wang@dadachinese.com',
        pass: process.env.TRANSPORT_PASS
    }
  });

exports.postContact = (req, res, next) => {
    const { name, message, email } = req.body;

    transport.sendMail({
        to: 'jingyi.wang@dadachinese.com',
        from: email,
        subject: 'Contact form on dadachinese',
        html: `<p>From: ${name}</p><br></br><p>Email: ${email}</p><br></br><p>${message}</p>`
    }).then((response) => {
        res.status(200).json({
            message: 'Success'
        });
    }).catch((err) => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }

        next(err);
    });
}