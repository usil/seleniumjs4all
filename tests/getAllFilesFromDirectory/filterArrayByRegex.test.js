const { filterArrayByRegex } = require("../../src/helpers/testHelpers");

describe('Filter Array By Regex', () => {
    test('should return empty aray if send empty array', () => {
        const resp = filterArrayByRegex([], "");
        expect(resp.length).toBe(0);
    });

    test('should return filtered aray if send the correct params', () => {
        const regex = /^.+\.read\.test\.js$/;
        const arrayOfElements = [
            "filterArrayByRegex.read.test.js",
            "getAllFilesFromDirectory.read.test",
            "createTableHtmlToReportMailer.update.test.js",
            "prueba.read.test.js",
        ]
        const resp = filterArrayByRegex(arrayOfElements, regex);
        expect(resp.length).toBe(2)
    });
})