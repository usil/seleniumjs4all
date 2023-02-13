const nodemailer = require('nodemailer');

function MailService() {
  this.transporter;

  this.initialize = () => {
    if (typeof this.transporter !== 'undefined') {
      return;
    }

    const smtpSettings = {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE ?? true,
      tls: {
        ciphers: process.env.SMTP_TLS_CIPHERS ?? 'SSLv3',
      },
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    };

    if (process.env.SMTP_SECURE) {
      smtpSettings.secure = JSON.parse(process.env.SMTP_SECURE.toLowerCase());
    }

    if (process.env.SMTP_TLS_CIPHERS) {
      smtpSettings.tls.ciphers = process.env.SMTP_TLS_CIPHERS;
    }

    this.transporter = nodemailer.createTransport(smtpSettings);
  };

  this.sendMail = async (params) => {
    this.initialize();
    const mailOptions = {
      from: process.env.SMTP_FROM_ALIAS ?? process.env.SMTP_USER,
      to:  process.env.SMTP_TO,
      subject:  process.env.SMTP_SUBJECT ?? 'Selenium Reporter',
      attachments: [
        {
            filename: params?.filename + '.gzip',
            path: params?.sourcePath,
            contentType: params?.contentType
        }
      ]
    }
    if (typeof params == 'undefined') {
      console.log('Error: Params is required to send an email');
      return;
    }
    if (typeof mailOptions.to == 'undefined') {
      console.log('Error: SMTP_TO is required to send an email');
      return;
    }
    if (typeof mailOptions.subject == 'undefined') {
      console.log('Error: SMTP_SUBJECT is required to send an email');
      return;
    }
    if (typeof mailOptions.attachments == 'undefined' || mailOptions.attachments.length < 1) {
      console.log('Error: Attachments are required to send files to mail');
      return;
    }

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:' + info.response);
    } catch (error) {
      console.log('Error while send message on error for mail');
      console.log(error);
    }
  };
}

module.exports = MailService;