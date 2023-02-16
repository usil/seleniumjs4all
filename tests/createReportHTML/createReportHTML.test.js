const { createReportHTML } = require("../../src/helpers/testHelpers");
const path = require("path");
const { EnvSettings } = require("advanced-settings");
const envSettings = new EnvSettings();
const packPath = require("package-json-path");
const { v4 } = require("uuid");


const rootPath = path.dirname(packPath(("")));

describe('Create report html', () => {
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
        const testOptions = envSettings.loadJsonFileSync( path.join(__dirname, "mock", "01testOptions.json"), "utf8");
        const resp = await createReportHTML("zsfs", 515151, testOptions, 5215, rootPath);
        expect(resp).toBe("The report web is not required here")
    });
    test('Should return message if report web is not present on testOptions file', async () => {
        const testOptions = envSettings.loadJsonFileSync( path.join(__dirname, "mock", "02testOptions.json"), "utf8");
        const resp = await createReportHTML("zsfs", 515151, testOptions, 5215, rootPath);
        expect(resp).toBe("The report web is not required here")
    });
    
    test('Should create the report html, with one virtualSuite', async () => {
        const testOptions = envSettings.loadJsonFileSync( path.join(__dirname, "mock", "03testOptions.json"), "utf8");
        console.log(path.join(__dirname, "mock", "03testOptions.json"),"+++");
        const TEST_UUID = v4();
        const suiteIdentifier = testOptions.virtualUserSuites[0].identifier;
        const resp = await createReportHTML(suiteIdentifier, 0, testOptions, TEST_UUID, path.join(__dirname, "mock"));
        expect(resp).toBe("Created report")
    });
});