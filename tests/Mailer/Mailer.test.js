const MailService = require("../../src/helpers/Mailer");
const nodemailer = require('nodemailer');
const path = require("path");
const { v4 } = require("uuid");
const getBrowserDriver = require("../../src/browsers/browserDriver");
const { By } = require("selenium-webdriver");

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

    test.skip('should reach the message on the smtp server', async () => {
        const customMailer = new MailService();
        const params = {
            filename: "test-report",
            sourcePath: path.resolve(__dirname, "mocks", "test-report.zip"),
            suiteIdentifier: "aabbcc"
        }
        let testAccount = await nodemailer.createTestAccount();
        const uuid = v4();
        const status = "Success";
        const body = "There aren't errors";
        const smtpParams = {
            enableSmtpNotification: true,
            smtpHost: "smtp.ethereal.email",
            smtpSecure: false,
            smtpPort: 587,
            smtpUser: testAccount.user,
            smtpPassword: testAccount.pass,
            smtpRecipients: "random@random.com, random2@random2.com",
        }
        const resp = await customMailer.sendMail(params, uuid, status, body, smtpParams );
        const previewUrlOfMessageSendByMail = nodemailer.getTestMessageUrl(resp);
        console.log("Preview URL: %s", previewUrlOfMessageSendByMail);
        await driver.get(previewUrlOfMessageSendByMail);
        const subjectMessage = await driver.findElement(By.xpath('//*[@id="message-header"]/div[1]/span'));
        const buttonDownloadAttachment = await driver.findElement(By.xpath('//*[@id="myTabContent"]/div[1]/a'));
        expect(await subjectMessage.getText()).toContain(uuid);
        expect(buttonDownloadAttachment).toBeTruthy();
    })

    afterAll( async () => {
        await driver.quit();
    })
});