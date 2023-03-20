const { getVariable, formatVarsEnv } = require("../../src/helpers/testHelpers");
const { EnvSettings } = require("advanced-settings");
const path = require("path");
const { env } = require("process");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

const envSettings = new EnvSettings();


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
    test('should return the all values and variables with formatVarsEnv', async () => {
        const testOptions = envSettings.loadJsonFileSync( path.join(__dirname, "mock", "combineTestOptions.json"), "utf8");
        const varToEnv = formatVarsEnv(testOptions.virtualUserSuites[0].variables);
        for (const key in varToEnv) {
            process.env[key] = varToEnv[key];
        }
        const resp = getVariable("first");
        const resp2 = getVariable("web.level_2.level_3.random_3");
        const resp3 = getVariable("web.level_2.level_3.level_4.pie");

        expect(resp).toBe("888888");
        expect(resp2).toBe("515s1f5s1f");
        expect(resp3).toBe("random text");

        
    });
});