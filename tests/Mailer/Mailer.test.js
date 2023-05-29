const MailService = require("../../src/helpers/Mailer");
const Nodemailer = require('nodemailer');
const nodemailer = require('nodemailer');
const path = require("path");
const { v4 } = require("uuid");
const getBrowserDriver = require("../../src/browsers/browserDriver");
const { By } = require("selenium-webdriver");
const SMTPTester = require("smtp-tester");


describe('Mailer test', () => {
    let mailer;
    let driver;
    let smtpParams = {
        host: "l.l"
    }
    beforeAll( async () => {
        mailer = new MailService();
        driver = await getBrowserDriver();
    })

    test('should return empty if the transporter variable is undefined when try call initialize function', async () => {
        mailer.transporter = "new value";
        const resp = await mailer.initialize(smtpParams);
        expect(resp).toBe(undefined);
    });
    test('should return undefined if the first param is null or undefined when try call sendMail function', async () => {
        const resp = await mailer.sendMail(undefined, 5656, "filer","", smtpParams)
        expect(resp).toBe(undefined);
    });

    test('should return undefined if smtpParams.smtpRecipients is undefined when try call sendMail function', async () => {
        const customMailer = new MailService();
        const params = {
            filename: "test-file",
            sourcePath: "home/path",
            suiteIdentifier: "aabbcc"
        }
        const uuid = "125eeee";
        const status = "Success";
        const body = "There aren't errors";
        const smtpParams = {
            enableSmtpNotification: null,
            disableMailNotificationOnSuccess: null,
            smtpHost: null,
            smtpPort: null,
            smtpUser: null,
            smtpPassword: null,
            smtpTlsCiphers: null,
            smtpRecipients: undefined,
        }
        const resp = await customMailer.sendMail(params, uuid, status, body, smtpParams );
        expect(resp).toBe(undefined);
    });

    test('should reach the message on the smtp server', async () => {
        let smtpEmailResponse;
        const port = 4025;
        const customMailer = new MailService();
        const smtpTester    = SMTPTester.init(port);
        const sender = 'foo@random123.com';
        const recipient = 'acme231@mail.com';
        const subject   = 'email test';
        const body      = 'This is a test email';
        function handler(address, id, email) {
            expect(address).toBe(recipient)
            smtpEmailResponse = email;
            smtpTester.unbind(recipient, handler);
            smtpTester.removeAll();
            smtpTester.stop();
        }
        smtpTester.bind(recipient, handler);

        const params = {
            filename: "test-report",
            sourcePath: path.resolve(__dirname, "mocks", "test-report.zip"),
            suiteIdentifier: "aabbcc"
        }
        // let testAccount = await nodemailer.createTestAccount();
        const uuid = v4();
        const status = "Success";
        const smtpParams = {
            enableSmtpNotification: true,
            smtpHost: "",
            smtpSecure: "",
            smtpPort: port,
            smtpUser: sender,
            smtpPassword: "",
            smtpRecipients: recipient,
            // https://stackoverflow.com/a/58819828
            smtpTlsCiphers: "TLS_AES_128_GCM_SHA256"
        }
        const resp = await customMailer.sendMail(params, uuid, status, body, smtpParams, "", subject );

        expect(sender).toBe(resp.envelope.from);
        expect(sender).toBe(smtpEmailResponse.sender);
        expect(smtpEmailResponse.headers['message-id']).toBe(resp.messageId);
        expect(smtpEmailResponse.headers.subject).toBe(subject);
        expect(smtpEmailResponse.html).toBe(body);


       /*  const previewUrlOfMessageSendByMail = nodemailer.getTestMessageUrl(resp);
        console.log("Preview URL: %s", previewUrlOfMessageSendByMail);
        await driver.get(previewUrlOfMessageSendByMail);
        const subjectMessage = await driver.findElement(By.xpath('//*[@id="message-header"]/div[1]/span'));
        const buttonDownloadAttachment = await driver.findElement(By.xpath('//*[@id="myTabContent"]/div[1]/a'));
        expect(await subjectMessage.getText()).toContain(uuid);
        expect(buttonDownloadAttachment).toBeTruthy(); */
    })

    afterAll( async () => {
        await driver.quit();
    })
});