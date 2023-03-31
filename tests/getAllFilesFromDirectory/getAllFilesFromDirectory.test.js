const path = require("path");
const { getAllFilesFromDirectory } = require("../../src/helpers/testHelpers");

describe('Get all files from directory', () => {

    test('should return all files that contains .js in its name from any directory', () => {
        const mockRoot = path.resolve(__dirname, "mocks", "mockTestDirectory");
        const files = getAllFilesFromDirectory(mockRoot, ".js");
        expect(files.length).toBe(6)
    });

    test('should return all files that contains .html in its name from any directory', () => {
        const mockRoot = path.resolve(__dirname, "mocks", "mockTestDirectory");
        const files = getAllFilesFromDirectory(mockRoot, ".html");
        expect(files.length).toBe(1)
    });

    test('should return all files that contains .md in its name from any directory', () => {
        const mockRoot = path.resolve(__dirname, "mocks", "mockTestDirectory");
        const files = getAllFilesFromDirectory(mockRoot, ".md");
        expect(files.length).toBe(1)
    });
    test('should return all files that contains .json in its name from any directory', () => {
        const mockRoot = path.resolve(__dirname, "mocks", "mockTestDirectory", "jsonTestFiles");
        const files = getAllFilesFromDirectory(mockRoot, ".json");
        expect(files.length).toBe(3)
    });
    
});