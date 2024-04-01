const { EnvSettings } = require("advanced-settings");
const { formatVarsEnv, getVariable } = require("../../src/helpers/testHelpers");
const path = require("path");
const envSettings = new EnvSettings();

describe('Format Variables by testOptions', () => {
   test('Should return all variables', async () => {
      const testOptions = envSettings.loadJsonFileSync( path.join(__dirname, "mock", "settings.json"), "utf8");
      const resp = formatVarsEnv(testOptions.virtualUserSuites[0].variables);
      expect(Object.keys(resp).length).toBe(15);
      expect(resp.firsttt).toBe("888888");
      expect(resp.usil_web___sss___ddd).toBe("54454");
      expect(resp.usil_web___sss___sssdd___pipipi___pie).toBe("515s1f5s1f");
   });
   test('Should return all normal variables', () => {
      const testOptions = envSettings.loadJsonFileSync( path.join(__dirname, "mock", "normal_settings.json"), "utf8");
      const resp = formatVarsEnv(testOptions.virtualUserSuites[0].variables);
      expect(Object.keys(resp).length).toBe(4);
      expect(resp.first).toBe("free");
      expect(resp.post).toBe("8451");
   });
   test('Should return all combine variables', () => {
      const testOptions = envSettings.loadJsonFileSync( path.join(__dirname, "mock", "combined_settings.json"), "utf8");
      const resp = formatVarsEnv(testOptions.virtualUserSuites[0].variables);
      expect(Object.keys(resp).length).toBe(9);
      expect(resp.new_variable).toBe("54");
      expect(resp.web___level_2___random_1).toBe("54454");
      expect(resp.web___level_2___level_3___random_3).toBe("515s1f5s1f");
   });
});