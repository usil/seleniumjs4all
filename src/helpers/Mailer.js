const nodemailer = require('nodemailer');

function MailService() {
  this.transporter;

  this.initialize = (smtpParams) => {
    if (typeof this.transporter !== 'undefined') {
      return;
    }

    const smtpSettings = {
      host: smtpParams?.smtpHost,
      port: smtpParams?.smtpPort,
      secure: smtpParams?.smtpSecure ?? true,
      tls: {
        ciphers: smtpParams?.smtpTlsCiphers ?? 'SSLv3',
      },
      auth: {
        user: smtpParams?.smtpUser,
        pass: smtpParams?.smtpPassword,
      },
    };

    this.transporter = nodemailer.createTransport(smtpSettings);
  };
  /**
   *
   * @param {Object} params Params to send Mail transmitter
   * @param {string} params.filename filename is a name that report will send
   * @param {string} params.sourcePath sourcePath is a path of file to find and then send
   * @param {string} params.contentType contentType type of content to send
   * @param {string | number} uuid uuid is unique identifier
   * @param {string} status status <failed | passed>
   * 
   * @description Send Mail with the generated report
   * @returns {void}
   */
  this.sendMail = async (params, uuid, status, body = "", smtpParams) => {
    this.initialize(smtpParams);

    let fromDefinitive;
    if (!smtpParams?.smtpSenderDisplayname || smtpParams?.smtpSenderDisplayname?.includes('$')) {
      fromDefinitive = smtpParams?.smtpUser;
    } else {
      fromDefinitive = `${smtpParams?.smtpSenderDisplayname} <${smtpParams?.smtpUser}>`;
    }

    const mailOptions = {
      from: fromDefinitive,
      to:  smtpParams?.smtpRecipients,
      subject:  (smtpParams?.smtpSubject ?? 'Selenium Reporter') + ": " + uuid + " - status: " + status,
      html: "<p>" + body + "</p>",
      attachments: [
        {
            filename: params?.filename + '.zip',
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
      console.log('Error: SMTP_RECIPIENTS is required to send an email');
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