/* istanbul ignore next */
const nodemailer = require('nodemailer');
const puppeteer = require('puppeteer');


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
   * @param {Object} smtpParams smtpParams are params to configurate your smtp to send mail
   * @param {boolean} smtpParams.enableSmtpNotification determines if the email with the report is sent
   * @param {string} smtpParams.disableMailNotificationOnSuccess determines if the report is sent when the test result is positive
   * @param {string} smtpParams.smtpHost host of smtp
   * @param {string} smtpParams.smtpPort port of smtp
   * @param {string} smtpParams.smtpUser user of smtp
   * @param {string} smtpParams.smtpPassword password of smtp
   * @param {string} smtpParams.smtpTlsCiphers 
   * @param {string} smtpParams.smtpSenderDisplayname alias of smtp
   * @param {string} smtpParams.smtpRecipients receptors of reports
   * @param {string} emojiUniCode
   * @param {string} customEmailSubjectPattern
   * 
   * 
   * 
   * @description Send Mail with the generated report
   * @returns {void}
   */
  this.sendMail = async (params, uuid, status, body = "", smtpParams, emojiUniCode = "", customEmailSubjectPattern = null) => {
    if (typeof params == 'undefined') {
      console.log('Error: Params is required to send an email');
      return;
    }
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
      html:  body,
      attachments: [
        {
            filename: params?.filename + '.zip',
            path: params?.sourcePath,
            contentType: params?.contentType
        }
      ]
    }
    if (typeof mailOptions.to == 'undefined') {
      console.log('Error: SMTP_RECIPIENTS is required to send an email');
      return;
    }
    if (typeof mailOptions.attachments == 'undefined' || mailOptions.attachments.length < 1) {
      console.log('Error: Attachments are required to send files to mail');
      return;
    }

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:' + info.response);
      return info;
    } catch (error) {
      console.log('Error while send message on error for mail');
      console.log(error);
      return error;
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
  },
  this.createTableHtmlToReportMailer = async (resourceHtmlPath, titleBody) => {

    if (!resourceHtmlPath) {
      return "";
    }
    const browser = await puppeteer.launch({ 
      headless: true,
      args: [
          '--disable-gpu',
          '--disable-dev-shm-usage',
          '--disable-setuid-sandbox',
          '--no-first-run',
          '--no-sandbox',
          '--no-zygote',
          '--deterministic-fetch',
          '--disable-features=IsolateOrigins',
          '--disable-site-isolation-trials',
      ]
    });
    const page = await browser.newPage();
    await page.goto("file:///" + resourceHtmlPath);
    const tableElement = await page.$('#table');
    const failsIdsElement =  await page.$("#failed-test-case-ids");
    const customStyle = "<style> table { font-family: arial, sans-serif; border-collapse: collapse; width: 100%; } td, th { border: 1px solid #dddddd; text-align: left; padding: 8px; /* width: 25%; */ max-width: 200px; } .test-result-table { border: 1px solid black; width: 800px; } .test-result-table-header-cell { border-bottom: 1px solid black; background-color: silver; } .test-result-step-command-cell { border-bottom: 1px solid gray; text-overflow: ellipsis; overflow: hidden; /* white-space: nowrap; */ word-wrap: break-word; } .test-result-step-description-cell { border-bottom: 1px solid gray; } .test-result-step-result-cell-ok { border-bottom: 1px solid gray; background-color: green; } .test-result-step-result-cell-failure { border-bottom: 1px solid gray; background-color: red; } .test-result-step-result-cell-notperformed { border-bottom: 1px solid gray; background-color: white; } .test-result-describe-cell { background-color: tan; font-style: italic; } .test-cast-status-box-ok { border: 1px solid black; float: left; margin-right: 10px; width: 45px; height: 25px; background-color: green; } .error { width: 100%; height: 100%; top: 0px; left: 0px; background: #202020; font-size: 11px; font-family: Courier; color: #DFDFDF; } .error pre { white-space: pre-wrap; /* Since CSS 2.1 */ white-space: -moz-pre-wrap; /* Mozilla, since 1999 */ white-space: -pre-wrap; /* Opera 4-6 */ white-space: -o-pre-wrap; /* Opera 7 */ word-wrap: break-word; /* Internet Explorer 5.5+ */ } .clickable { cursor: pointer; } .container { width: 25%; margin: 15px auto; } .chart-container { text-align: center; width: 25%; display: block; margin: 0 auto; } .cell-with-comment{ position:relative; } .cell-comment{ display: none } .cell-with-comment:hover { overflow: visible; }  @media (max-width: 989px) { .chart-container { width: 50%; } } </style>"
    let bodyHtmlReport =customStyle + titleBody + `\n`;
    /* istanbul ignore next */
    const tableHtml = await page.evaluate(el => el?.innerHTML, tableElement);
    /* istanbul ignore next */
    const failsIdsHtml = await page.evaluate(el => el?.innerHTML, failsIdsElement);
    bodyHtmlReport = bodyHtmlReport.concat(`<div>${failsIdsHtml}</div>` + "<br/>" +  "<h2>Summary Test Result</h2>" + "<br />" + "<table>" + tableHtml + "</table>")
    await browser.close();
    return bodyHtmlReport;
  }
}

module.exports = MailService;