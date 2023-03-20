const { createTable } = require("../../src/helpers/testHelpers");
const path = require("path");

describe('Create Table of Report to Acme Company', () => {
    test('Should return table if correct data is sent, to Acme Company', async () => {
        const rootPath = path.join(path.dirname(__filename), "Acme");
        const table = await createTable("first-run", 484848, 155151, rootPath, ["first", "second", "third"], "dynamicDeep");
        expect(table.length).toBe(2)
    });
    test('Should return the correct number of headers', async () => {
        const rootPath = path.join(path.dirname(__filename), "Acme");
        const headers = ["first", "second", "third"];
        // * 2 is default because there are two columns for default in the functions to create table.
        const numberHeaders = 2 + headers.length;
        const table = await createTable("first-run", 484848, 155151, rootPath, headers, "dynamicDeep");
        expect(numberHeaders).toBe(table.options.head.length)
    });
    test('Should return negative response if sent bad identifier', async () => {
        const rootPath = path.join(path.dirname(__filename), "Acme");
        const response = await createTable("first-runs-not-exist", 484848, 155151, rootPath, ["first", "second", "third"], "dynamicDeep");
        expect(response).toBe("The file that contains jest result not exist");
    });
    test('SuiteIdentifier should be a real value, diferent undefined', async () => {
        const rootPath = path.join(path.dirname(__filename), "Acme");
        const response = await createTable(undefined, 484848, 155151, rootPath, ["first", "second", "third"], "dynamicDeep");
        expect(response).toBe("The suiteIdentifier must be a real value, diferent undefined, null, etc.");
    });
    test('SuiteIdentifier should be a real value, diferent null', async () => {
        const rootPath = path.join(path.dirname(__filename), "Acme");
        const response = await createTable(null, 484848, 155151, rootPath, ["first", "second", "third"], "dynamicDeep");
        expect(response).toBe("The suiteIdentifier must be a real value, diferent undefined, null, etc.");
    });
});

describe('Create Table of Report to Wonka Company', () => {
    test('Should return table if correct data is sent, to Wonka Company', async () => {
        const rootPath = path.join(path.dirname(__filename), "Wonka");
        const table = await createTable("second-run", 484848, 155151, rootPath, ["first", "second", "third"], "dynamicDeep");
        expect(table.length).toBe(1)
    });
    test('Should return the correct number of headers', async () => {
        const rootPath = path.join(path.dirname(__filename), "Wonka");
        const headers = ["first", "second"];
        // * 2 is default because there are two columns for default in the functions to create table.
        const numberHeaders = 2 + headers.length;
        const table = await createTable("second-run", 484848, 155151, rootPath, headers, "dynamicDeep");
        expect(numberHeaders).toBe(table.options.head.length)
    });
    test('Should return negative response if sent bad identifier', async () => {
        const rootPath = path.join(path.dirname(__filename), "Wonka");
        const response = await createTable("seconds-runs-not-exist", 484848, 155151, rootPath, ["first", "second", "third"], "dynamicDeep");
        expect(response).toBe("The file that contains jest result not exist");
    });
    test('SuiteIdentifier should be a real value, diferent undefined', async () => {
        const rootPath = path.join(path.dirname(__filename), "Wonka");
        const response = await createTable(undefined, 484848, 155151, rootPath, ["first", "second", "third"], "dynamicDeep");
        expect(response).toBe("The suiteIdentifier must be a real value, diferent undefined, null, etc.");
    });
    test('SuiteIdentifier should be a real value, diferent null', async () => {
        const rootPath = path.join(path.dirname(__filename), "Wonka");
        const response = await createTable(null, 484848, 155151, rootPath, ["first", "second", "third"], "dynamicDeep");
        expect(response).toBe("The suiteIdentifier must be a real value, diferent undefined, null, etc.");
    });
});