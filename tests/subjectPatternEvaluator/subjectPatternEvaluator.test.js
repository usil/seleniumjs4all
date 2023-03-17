const MailService = require('../../src/helpers/Mailer');

describe('Subject pattern evaluator', () => {
    let mailer;

    beforeAll(async () => {
        mailer = new MailService()
    })

    test('Should return the default subject if the string pattern is null', async () => {
        const stringPattern = null;
        const variables = {
            emojiUnicode: "emoji",
            status: "Failed",
            virtualUserSuiteIdentifier: "abc4",
            testExecutionIdentifier: "52658"
        }
        const result = `${variables.emojiUnicode} Selenium Reporter: #${variables.virtualUserSuiteIdentifier} - ${variables.testExecutionIdentifier} - status: ${variables.status}`;
        const fnResult = await mailer.subjectPatternEvaluator(stringPattern, variables);
        expect(result).toBe(fnResult);
    });
    test('Should return the correct subject if send only string', async () => {
        const stringPattern = "Result Selenium 949494" + 985;
        const variables = {
            emojiUnicode: "emoji",
            status: "Failed",
            virtualUserSuiteIdentifier: "99999999",
            testExecutionIdentifier: "52658"
        }
        const fnResult = await mailer.subjectPatternEvaluator(stringPattern, variables);
        expect(stringPattern).toBe(fnResult);
    });

    test('Should return the correct subject if send string and variables', async () => {
        const stringPattern = '"${emojiUnicode}" Result Selenium #${virtualUserSuiteIdentifier}';
        const variables = {
            emojiUnicode: "emoji",
            status: "Failed",
            virtualUserSuiteIdentifier: "999---99999",
            testExecutionIdentifier: "52658"
        }
        const result = `"${variables.emojiUnicode}" Result Selenium #${variables.virtualUserSuiteIdentifier}`;
        const fnResult = await mailer.subjectPatternEvaluator(stringPattern, variables);
        expect(result).toBe(fnResult);
    });

    test('Should return the correct subject with undefined if send variables non-existent variables', async () => {
        const stringPattern = '"${emojiUnicodes}" Result Selenium #${virtualUserSuiteIdentifierfre}';
        const variables = {
            emojiUnicode: "emoji",
            status: "Failed",
            virtualUserSuiteIdentifier: "999---99999",
            testExecutionIdentifier: "52658"
        }
        const result = `"undefined" Result Selenium #undefined`;
        const fnResult = await mailer.subjectPatternEvaluator(stringPattern, variables);
        expect(result).toBe(fnResult);
    });

    test('Should return the correct subject if send variables with incorrect syntax', async () => {
        const stringPattern = ' {status} Result Selenium #${virtualUserSuiteIdentifier';
        const variables = {
            emojiUnicode: "emoji",
            status: "Failed",
            virtualUserSuiteIdentifier: "999---99999",
            testExecutionIdentifier: "52658"
        }
        const fnResult = await mailer.subjectPatternEvaluator(stringPattern, variables);
        expect(stringPattern).toBe(fnResult);
    });
    test('Should return the correct subject if send enviroment variables', async () => {
        const nameEnviromentTest = "BLOB_CUSTOMIZE";
        process.env[nameEnviromentTest] = "NEW VALUE";
        const stringPattern = 'Result Selenium #${env:BLOB_CUSTOMIZE}-----${status}';
        const variables = {
            emojiUnicode: "emoji",
            status: "Failed",
            virtualUserSuiteIdentifier: "999---99999",
            testExecutionIdentifier: "52658"
        }
        const result = `Result Selenium #${process.env[nameEnviromentTest]}-----${variables.status}`;
        const fnResult = await mailer.subjectPatternEvaluator(stringPattern, variables);
        console.log(fnResult, "-----");
        expect(result).toBe(fnResult);
    });
    test('Should return the correct subject if send enviroment variables, strings and normal variables', async () => {
        const nameEnviromentTest = "normalvariable";
        process.env[nameEnviromentTest] = "custom_value";
        const nameEnviromentTest2 = "VARIABLE_CUSTOM";
        process.env[nameEnviromentTest2] = "custom value camel";
        const stringPattern = 'Result ${emojiUnicode} Selenium #${env:normalvariable}-----${status}  ${env:VARIABLE_CUSTOM} STRING PART ${testExecutionIdentifier}';
        const variables = {
            emojiUnicode: "\u{1f600}",
            status: "Failed",
            virtualUserSuiteIdentifier: "999---99999",
            testExecutionIdentifier: "52658"
        }
        const result = `Result ${variables.emojiUnicode} Selenium #custom_value-----${variables.status}  custom value camel STRING PART ${variables.testExecutionIdentifier}`;
        const fnResult = await mailer.subjectPatternEvaluator(stringPattern, variables);
        console.log(fnResult, "-----");
        expect(result).toBe(fnResult);
    });
});