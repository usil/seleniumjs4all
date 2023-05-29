/* istanbul ignore next */
const MailService = require('../../src/helpers/Mailer');
const path = require("path");


describe('Mailer - create table html to report mailer', () => {
    let mailer;
    beforeAll( async () => {
        mailer = new MailService();

    })
    test('should return html when send variables', async () => {
        const resourceReportPath = path.resolve(__dirname, "mocks", "result", "index.html");
        const titleBody = "custom title"
        const bodyTableHTML = await mailer.createTableHtmlToReportMailer(resourceReportPath, titleBody)
        expect(bodyTableHTML).toBeTruthy()
    });
    test('should return empty string when send bad resourceReportPath', async () => {
        const resourceReportPath = null;
        const titleBody = "custom title"
        const bodyTableHTML = await mailer.createTableHtmlToReportMailer(resourceReportPath, titleBody)
        expect(bodyTableHTML).toBe("")
    });
    test('should return html when failed tests', async () => {
        const resourceReportPath = path.resolve(__dirname, "mocks", "result", "index-failed.html");
        const titleBody = "custom title failed"
        const bodyTableHTML = await mailer.createTableHtmlToReportMailer(resourceReportPath, titleBody)
        expect(bodyTableHTML).toBeTruthy()
    });
});