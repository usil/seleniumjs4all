// my-custom-environment
const NodeEnvironment = require('jest-environment-node').TestEnvironment;
const { takeScreenshot } = require("../helpers/testHelpers");

class CustomNodeEnvironment extends NodeEnvironment {

    constructor(config, context) {
        super(config, context);
        this.global._testPath = context.testPath;
    }

    async setup() {
        await super.setup();
    }

    async handleTestEvent(event, state) {

        if (event.name === "test_start") {
            let testNames = [];
            let currentTest = event.test;
            while (currentTest) {
                testNames.push(currentTest.name);
                currentTest = currentTest.parent;
            }

            this.global._describeName = testNames[1]
            this.global._testName = testNames[0]
        }

        if (event.name === "test_fn_failure") {
            this.global._testStatus = "failure"
            //take screenshot on error
            takeScreenshot({
                driver: this.global.driver,
                filePath: this.global._testPath,
                screenshotAlias: `${this.global._describeName} - ${this.global._testName}`,
                error_screen: true
            });
        } else if (event.name === "test_fn_success") {
            this.global._testStatus = "success"
        }
    }
}

module.exports = CustomNodeEnvironment