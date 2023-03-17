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
   * @param {string} params.suiteIdentifier suite identifier from test
   * @param {string | number} uuid uuid is unique identifier
   * @param {string} status status <failed | passed>
   * 
   * @description Send Mail with the generated report
   * @returns {void}
   */
  this.sendMail = async (params, uuid, status, body = "", smtpParams, emojiUniCode = "", customEmailSubjectPattern = null) => {
    this.initialize(smtpParams);

    let fromDefinitive;
    if (!smtpParams?.smtpSenderDisplayname || smtpParams?.smtpSenderDisplayname?.includes('$')) {
      fromDefinitive = smtpParams?.smtpUser;
    } else {
      fromDefinitive = `${smtpParams?.smtpSenderDisplayname} <${smtpParams?.smtpUser}>`;
    };

    const subjectVariables = {
      emojiUnicode: emojiUniCode,
      status,
      virtualUserSuiteIdentifier: params?.suiteIdentifier,
      testExecutionIdentifier: uuid
    };
    const customSubject = await this.subjectPatternEvaluator(customEmailSubjectPattern, subjectVariables);
    const mailOptions = {
      from: fromDefinitive,
      to:  smtpParams?.smtpRecipients,
      subject: customSubject,
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

  /**
   *
   * @param {string} stringPattern stringPattern is a pattern to send the report by mail, more information in the documentation
   * @param {Object} variables variables to configurate the subject of Mail
   * @param {string} variables.emojiUnicode is a emoji in format unicode
   * @param {string} variables.virtualUserSuiteIdentifier virtualUserSuiteIdentifier identifier from test
   * @param {string} variables.testExecutionIdentifier testExecutionIdentifier is a randomly generated id
   * @param {string} variables.status status <failed | passed>
   * 
   * 
   * @description It is a function that receives a string pattern and variables that configure the subject according to some rules, more information in the documentation
   * @returns {string} modified subject
   */

  this.subjectPatternEvaluator = async (stringPattern, variables) => {
    if (stringPattern === null || stringPattern.length === 0) {
      return `${variables.emojiUnicode} Selenium Reporter: #${variables.virtualUserSuiteIdentifier} - ${variables.testExecutionIdentifier} - status: ${variables.status}`
    }
    const regex = /\$\{([a-zA-Z\:\_]*)\}/g;
    const variablesMatches = stringPattern.match(regex) || [];
    if (variablesMatches.length < 1) {
      return stringPattern;
    }    
    variablesMatches.map(variable => {
      const variableRegex = /(?<=\$\{)([a-zA-Z\:\_]*)(?=\})/;
      let pureVariableName = variable.match(variableRegex)[0];

      //verify if variable contains env
      const indexEnviromentPureVariableName = pureVariableName.search(/(env\:)/);

      if (indexEnviromentPureVariableName > -1 ) {
        pureVariableName = pureVariableName.replace(/(env\:)/, "");        
        stringPattern = stringPattern.replace(variable, process.env[pureVariableName])
      }else {
        const variableValue = variables[pureVariableName];
        stringPattern = stringPattern.replace(variable, variableValue);
      }
    });
    return stringPattern;
  }
}

module.exports = MailService;