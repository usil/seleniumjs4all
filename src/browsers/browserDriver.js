const chrome = require("selenium-webdriver/chrome");
const firefox = require("selenium-webdriver/firefox");
const finder = require('find-package-json');
const path = require("path");
const { Builder } = require("selenium-webdriver");
require("dotenv").config();
require("chromedriver");
require("geckodriver");
const packPath = require("package-json-path");

const rootPath = path.dirname(packPath(("")));

const browserOptions = require( path.join(rootPath, "browserOptions.json"));

const browserDriver = {
  /**
   *
   * @returns WebDriver
   * @description Return the driver for chrome
   */
  chrome: async () => {
    const driver = await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(
        new chrome.Options()
          .addArguments(...browserOptions.arguments)
          // .windowSize(screenSize)
      )
      .build();
    return driver;
  },
  /**
   *
   * @returns WebDriver
   * @description Return the driver for firefox
   */
  firefox: async () => {
    const driver = await new Builder()
      .forBrowser("firefox")
      .setFirefoxOptions(
        new firefox.Options()
          .addArguments(...browserOptions.arguments)
          // .windowSize(screenSize)
      )
      .build();
    return driver;
  },
};

const envBrowser = process.env.BROWSER;

const browser =
  envBrowser && (envBrowser === "chrome" || envBrowser === "firefox")
    ? envBrowser
    : "chrome";

const getBrowserDriver = browserDriver[browser];

module.exports = getBrowserDriver;
