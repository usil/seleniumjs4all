const { EnvSettings } = require("advanced-settings");
const { formatVarsEnv, getVariable } = require("../../src/helpers/testHelpers");
const path = require("path");
const envSettings = new EnvSettings();

describe('Format Variables by Env', () => {
   test('should return all variables', async () => {
      const testOptions = envSettings.loadJsonFileSync( path.join(__dirname, "mock", "testOptions.json"), "utf8");
      const resp = formatVarsEnv(testOptions.virtualUserSuites[0].variables);
      expect(Object.keys(resp).length).toBe(12)
   });
});