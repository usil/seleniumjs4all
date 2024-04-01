const { createReportHTML, fileExists } = require("../../src/helpers/testHelpers");
const path = require("path");
const { EnvSettings } = require("advanced-settings");
const envSettings = new EnvSettings();
const packPath = require("package-json-path");
const { v4 } = require("uuid");
const rootPath = path.dirname(packPath(("")));
const puppeteer = require('puppeteer');
const util = require("util");
const exec = util.promisify(require("child_process").exec);

describe('Create report htmljsdom', () => {
    test('Should return message if suiteIdentifier is null ', async () => {
        const resp = await createReportHTML(null, 6226, { name: "test" }, 54545, rootPath);
        expect(resp).toBe("The suiteIdentifier must be a real value { string | number | string && number }, diferent undefined, null, etc.")
    });
    test('Should return message if suiteIdentifier is undefined ', async () => {
        const resp = await createReportHTML(undefined, 6226, { name: "test" }, 54545, rootPath);
        expect(resp).toBe("The suiteIdentifier must be a real value { string | number | string && number }, diferent undefined, null, etc.")
    });
    
    test('Should return message if virtualUser is null ', async () => {
        const resp = await createReportHTML(5151, null, { name: "test" }, 54545, rootPath);
        expect(resp).toBe("The virtualUser must be a real value { string | number | string && number }, diferent undefined, null, etc.")
    });
    test('Should return message if virtualUser is undefined ', async () => {
        const resp = await createReportHTML("zsfs", undefined, { name: "test" }, 54545, rootPath);
        expect(resp).toBe("The virtualUser must be a real value { string | number | string && number }, diferent undefined, null, etc.")
    });

    test('Should return message if testOptions is null ', async () => {
        const resp = await createReportHTML(5151, 51515, null, 54545, rootPath);
        expect(resp).toBe("The testOptions must be a real value { Object }, diferent undefined, null, etc.")
    });
    test('Should return message if testOptions is undefined ', async () => {
        const resp = await createReportHTML("zsfs", 515151, undefined, 54545, rootPath);
        expect(resp).toBe("The testOptions must be a real value { Object }, diferent undefined, null, etc.")
    });

    test('Should return message if testUuid is null ', async () => {
        const resp = await createReportHTML(5151, 51515, { name: "test" }, null, rootPath);
        expect(resp).toBe("The testUuid must be a real value { string | number | string && number }, diferent undefined, null, etc.")
    });
    test('Should return message if testUuid is undefined ', async () => {
        const resp = await createReportHTML("zsfs", 515151, { name: "test" }, undefined, rootPath);
        expect(resp).toBe("The testUuid must be a real value { string | number | string && number }, diferent undefined, null, etc.")
    });

    test('Should return message if report web is false on testOptions file', async () => {
        const testOptions = envSettings.loadJsonFileSync( path.join(__dirname, "mock", "01_settings.json"), "utf8");
        const resp = await createReportHTML("zsfs", 515151, testOptions, 5215, rootPath);
        expect(resp).toBe("The report web is not required here")
    });
    test('Should return message if report web is not present on testOptions file', async () => {
        const testOptions = envSettings.loadJsonFileSync( path.join(__dirname, "mock", "02_settings.json"), "utf8");
        const resp = await createReportHTML("zsfs", 515151, testOptions, 5215, rootPath);
        expect(resp).toBe("The report web is not required here")
    });
    
    test('Should return a message when creating the html report, with just a virtual Suite', async () => {
        const testOptions = envSettings.loadJsonFileSync( path.join(__dirname, "mock", "03_settings.json"), "utf8");
        const TEST_UUID = v4();
        const suiteIdentifier = testOptions.virtualUserSuites[0].identifier;
        const resp = await createReportHTML(suiteIdentifier, 0, testOptions, TEST_UUID, path.join(__dirname, "mock"));
        expect(resp).toBe("Created report")
    });
    test('Should return a message when path of jest output is nor correct', async () => {
        const testOptions = envSettings.loadJsonFileSync( path.join(__dirname, "mock", "03_settings.json"), "utf8");
        const TEST_UUID = v4();
        const suiteIdentifier = testOptions.virtualUserSuites[0].identifier;
        const resp = await createReportHTML(suiteIdentifier, 0, testOptions, TEST_UUID, path.join(__dirname, "mocksd"));
        expect(resp).toBe("There isnt jest output test")
    });
    test('Should create a report html into path ./report/${identifier}/${virtualUser}, there should be an index.html file', async () => {
        const rootPath = path.dirname(packPath(("")));
        const testOptions = envSettings.loadJsonFileSync( path.join(__dirname, "mock", "03_settings.json"), "utf8");
        const TEST_UUID = v4();
        const suiteIdentifier = testOptions.virtualUserSuites[0].identifier;
        const resp = await createReportHTML(suiteIdentifier, 0, testOptions, TEST_UUID, path.join(__dirname, "mock"));
        expect(resp).toBe("Created report")
        const existReport = fileExists(path.join(rootPath, "report", TEST_UUID, '0', "index.html"));
        expect(existReport).toBe(true);
    });

    test('should be find the correct headers, rows and graphic in the report generated', async () => {
        const rootPath = path.dirname(packPath(("")));
        const testOptions = envSettings.loadJsonFileSync( path.join(__dirname, "mock", "test-puppeter.json"), "utf8");
        const TEST_UUID = v4();
        const suiteIdentifier = testOptions.virtualUserSuites[0].identifier;        
        const resp = await createReportHTML(suiteIdentifier, 0, testOptions, TEST_UUID, path.join(__dirname, "mock"));
        expect(resp).toBe("Created report")
        const routeOfHTMLReport = path.join(rootPath, "report", TEST_UUID, '0', "index.html");
        const existReport = fileExists(routeOfHTMLReport);
        expect(existReport).toBe(true);
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
        await page.goto("file:///" + routeOfHTMLReport);

        const headersTable = await page.$$('.test-result-table-header-cell');
        expect(headersTable.length).toBe(5);
        const rowsTable = await page.$x("/html/body/table/tbody/tr");
        expect(rowsTable.length).toBe(5);
        const charGraphic = await page.$x("//*[@id='myChar']");
        expect(charGraphic).toBeDefined()
        // await page.close()
        await browser.close();

    });
});