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

const browserOptions = require(path.join(rootPath, "browserOptions.json"));

const browserDriver = {
  /**
   *
   * @returns WebDriver
   * @description Return the driver for chrome
   */
  chrome: async () => {
    let chromeOptions = new chrome.Options();
    let optionsKeys;
    if (browserOptions.options) {
      optionsKeys = Object.keys(browserOptions.options);
    }
    if (optionsKeys?.length > 0) {
      optionsKeys.map(option => {
        try {
          if ( typeof browserOptions.options[option] === "string") {
            chromeOptions = chromeOptions[option](browserOptions.options[option]);
          } else if (Array.isArray(browserOptions.options[option])) {
            chromeOptions = chromeOptions[option](...browserOptions.options[option]);
          }
        } catch (error) {
          console.log("There are error when you try set chrome options, check your browserOptions.json file");
          console.log(error)
        }
      })
    }
    const driver = await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(chromeOptions)
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
