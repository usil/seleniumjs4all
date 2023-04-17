const { until, By, WebDriver, WebElement, WebElementCondition } = require("selenium-webdriver");

const utils = {
    /**
     * 
     * @param {WebDriver} driver WebDriver client, which provides control over a browser
     * @param {String} buttonName Name of button element
     * @returns Button element
     */
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
    /**
     * 
     * @param {WebDriver} driver WebDriver client, which provides control over a browser
     * @param {String} buttonName Name of button element
     * @returns Button element
     */
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
    /**
     * 
     * @param {WebDriver} driver WebDriver client, which provides control over a browser
     * @param {String} url website url to open
     */
    openPage: async (driver, url) => {
        await driver.get(url);
    },
    /**
     * 
     * @param {WebDriver} driver WebDriver client, which provides control over a browser
     */
    quitPage: async (driver) => {
        await driver.quit();
    },
    /**
     * 
     * @param {WebDriver} driver WebDriver client, which provides control over a browser
     * @returns Array of window handles.
     */
    getAllWindows: async(driver) => {
        const windows = await driver.getAllWindowHandles();
        return windows;
    },
    /**
     * 
     * @param {WebDriver} driver WebDriver client, which provides control over a browser
     * @param {Array} allWindows Array of window handles.
     * @param {Number} positionPage position of windows
     */
    switchPage: async(driver, allWindows, positionPage) => {
        await driver.switchTo().window(allWindows[positionPage]);
    },
    /**
     * 
     * @param {WebDriver} driver WebDriver lient, which provides control over a browser.
     * @param {Number} timeToWait time in seconds to wait the element
     */
    implicitWait: async(driver, timeToWait) => {
        await driver.sleep(timeToWait);
    },
    /**
     * 
     * @param {WebDriver} driver WebDriver client, which provides control over a browser
     * @param {WebElementCondition} condition Defines a condition that will result in a WebElement
     * @param {Number} timeToWait Time in seconds to wait the element
     * @returns Web element
     */
    explicitWaitElement: async(driver, condition, timeToWait) => {
        const element = await driver.wait(driver => condition.fn(driver), timeToWait);
        return element;
    },
    /**
     * 
     * @param {WebDriver} driver WebDriver client, which provides control over a browser
     * @param {WebElementCondition} condition Defines a condition that will result in a WebElement
     * @param {Number} timeToWait Time in seconds to wait the element
     * @param {String} message Message that appear when there is any error 
     * @param {Number} timeToCheck Time in second to check the condition before timeToWait expires
     * @returns Web element
     */
    fluentWaitElement: async(driver, condition, timeToWait, message = "ERROR", timeToCheck = 500) => {
        const element = await driver.wait(driver => condition.fn(driver), timeToWait, message, timeToCheck);
        return element;
    },
    /**
     * 
     * @param { WebDriver } driver WebDriver client, which provides control over a browser.
     * @param { WebElement } element Web element
     */
    scriptClick: async(driver, element) => {
        await driver.executeScript("arguments[0].click();", element);
    }
}

module.exports = utils;