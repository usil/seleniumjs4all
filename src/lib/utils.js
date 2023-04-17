const { until, By } = require("selenium-webdriver");

const utils = {
    getAnyButton: async (driver, buttonName) => {
        const anyButton = await driver.wait(
          until.elementLocated(
            By.xpath(`//button[contains(text(), '${buttonName}')]`)
          ),
          2 * 1000,
          `There isn't ${buttonName} Button`,
          400
        );
        return anyButton;
    },
    getAnyButtonAndClick: async (driver, buttonName) => {
        const anyButton = await driver.wait(
            until.elementLocated(
            By.xpath(`//button[contains(text(), '${buttonName}')]`)
            ),
            30000,
            `There isn't ${buttonName} Button`,
            400
        );
        await driver.executeScript("arguments[0].click();", anyButton);
        return anyButton;
    },
    openPage: async (driver, url) => {
        await driver.get(url);
    },
    quitPage: async (driver) => {
        await driver.quit();
    },
    getAllWindows: async(driver) => {
        const windows = await driver.getAllWindowHandles();
        return windows;
    },
    switchPage: async(driver, allWindows, positionPage) => {
        await driver.switchTo().window(allWindows[positionPage]);
    },
    implicitWait: async(driver, timeToWait) => {
        await driver.sleep(timeToWait);
    },
    explicitWaitElement: async(driver, condition, timeToWait) => {
        const element = await driver.wait(driver => condition.fn(driver), timeToWait);
        return element;
    },
    fluentWaitElement: async(driver, condition, timeToWait, message = "ERROR", timeToCheck = 500) => {
        const element = await driver.wait(driver => condition.fn(driver), timeToWait, message, timeToCheck);
        return element;
    },
    scriptClick: async(driver, element) => {
        await driver.executeScript("arguments[0].click();", element);
    }
}

module.exports = utils;