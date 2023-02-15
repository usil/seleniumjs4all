const { sortTestResults } = require("../../src/helpers/testHelpers");
const data = require("./mock/data");
const { test01, test02, test03 } = data;
describe('Sort tests result', () => {
    test('Return message if the results is not present ', async () => {
        const result = await sortTestResults();
        expect(result).toBe("You must send an array with data");
    });
    test('Return message if the result is only a array without data', async () => {
        const result = await sortTestResults([]);
        expect(result).toBe("The array must contain data");
    });
    test('Return message if the result is only a array without data', async () => {
        const result = await sortTestResults([]);
        expect(result).toBe("The array must contain data");
    });
    test('Should return the same result if the array contains only one element', async () => {
        const arr = ["element"];
        const result = await sortTestResults(arr);
        expect(result).toBe(arr);
    });
    test('Should return the correct result orderly', async () => {
        const result = await sortTestResults(test01.mockResultDisorderly);
        expect(result).toEqual(test01.mockResultOrderly);

        const result2 = await sortTestResults(test02.mockResultDisorderly);
        expect(result2).toEqual(test02.mockResultOrderly);

        const result3 = await sortTestResults(test03.mockResultDisorderly);
        expect(result3).toEqual(test03.mockResultOrderly);

        
    });
});