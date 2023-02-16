const { getVariable } = require("../../src/helpers/testHelpers");

describe('Get Variable', () => {
    test('should return the correct variable, to number ', () => {
        process.env.RANDOM = 5695;
        const resp = getVariable("RANDOM")
        expect(resp).toBe(process.env.RANDOM)
    });

    test('should return the correct variable, to string ', () => {
        process.env.RANDOM_TWO = "test2";
        const resp = getVariable("RANDOM_TWO")
        expect(resp).toBe(process.env.RANDOM_TWO)
    });

    test('should return the correct variable, to lower case ', () => {
        process.env.new_new03 = "test04";
        const resp = getVariable("new_new03")
        expect(resp).toBe(process.env.new_new03)
    });
});