const MailService = require("../../src/helpers/Mailer");

describe('Mailer test', () => {
    let mailer;
    let smtpParams = {
        host: "l.l"
    }
    beforeAll( async () => {
        mailer = new MailService();
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
});