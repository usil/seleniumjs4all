const chrome = require("selenium-webdriver/chrome");
const firefox = require("selenium-webdriver/firefox");
const path = require("path");
const { Builder } = require("selenium-webdriver");
require("dotenv").config();
require("chromedriver");
require("geckodriver");
const packPath = require("package-json-path");
const BrowserHelper = require("./BrowserHelper.js");

const rootPath = path.dirname(packPath(("")));

const browserSettings = require(path.join(rootPath, "settings.json")).browserSettings;

const browserDriver = {
  /**
   *
   * @returns WebDriver
   * @description Return the driver for chrome
   */
  chrome: async () => {

    let chromeOptions = new chrome.Options();
    let optionsKeys;
    if (browserSettings.options) {
      optionsKeys = Object.keys(browserSettings.options);
    }
    if (optionsKeys?.length > 0) {
      optionsKeys.map(option => {
        try {
          if ( typeof browserSettings.options[option] === "string") {
            chromeOptions = chromeOptions[option](browserSettings.options[option]);
          } else if (Array.isArray(browserSettings.options[option])) {
            chromeOptions = chromeOptions[option](...browserSettings.options[option]);
          }
        } catch (error) {
          console.log("There are error when you try set chrome options, check your browserSettings in the settings.json file");
          console.log(error)
        }
      })
    }

    //default browser with default driver
    if(!browserSettings.browserDriverCustomLocation && !browserSettings.browserBinaryCustomLocation){      
      return await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(chromeOptions)
      .build();
    }

    if(browserSettings.browserBinaryCustomLocation && !browserSettings.browserDriverCustomLocation){
      throw Error("custom browser binary needs a custom driver but browserDriverCustomLocation is null");
    }
      

    //download stable version
    if(browserSettings.browserDriverCustomLocation){
      if(browserSettings.browserBinaryCustomLocation){ //custom browser with custom driver
        var service = new chrome.ServiceBuilder(browserSettings.browserDriverCustomLocation);
        chromeOptions.setChromeBinaryPath(browserSettings.browserBinaryCustomLocation)
        return await new Builder()
        .forBrowser("chrome")
        .setChromeService(service)
        .setChromeOptions(chromeOptions)
        .build();  
      }else{ //default browser with custom driver
        var service = new chrome.ServiceBuilder(browserSettings.browserDriverCustomLocation);
        return await new Builder()
        .forBrowser("chrome")
        .setChromeService(service)
        .setChromeOptions(chromeOptions)
        .build();        
      }
    }else{
      //default mode : 
      //browser and driver will be downloaded and configured
      var browserHelper = new BrowserHelper();
      var version = await browserHelper.getVersionByBuildId("chrome", "stable");
      var binaryResponse = await browserHelper.downloadBrowserBinary("chrome", version);
      var driverResponse = await browserHelper.downloadBrowserDriver("chrome", version);   
      var service = new chrome.ServiceBuilder(driverResponse.executableLocation);
      chromeOptions.setChromeBinaryPath(binaryResponse.executableLocation)
      return await new Builder()
      .forBrowser("chrome")
      .setChromeService(service)
      .setChromeOptions(chromeOptions)
      .build();       
    }
  },
  /**
   *
   * @returns WebDriver
   * @description Return the driver for firefox
   */
  firefox: async () => {

    let firefoxOptions = new firefox.Options();
    let optionsKeys;
    if (browserSettings.options) {
      optionsKeys = Object.keys(browserSettings.options);
    }
    if (optionsKeys?.length > 0) {
      optionsKeys.map(option => {
        try {
          if ( typeof browserSettings.options[option] === "string") {
            firefoxOptions = firefoxOptions[option](browserSettings.options[option]);
          } else if (Array.isArray(browserSettings.options[option])) {
            firefoxOptions = firefoxOptions[option](...browserSettings.options[option]);
          }
        } catch (error) {
          console.log("There are error when you try set chrome options, check your browserSettings in the settings.json file");
          console.log(error)
        }
      })
    }

    var webDriverCustomLocation = process.env.GECKO_DRIVER_LOCATION || browserSettings.webDriverAbsoluteLocation;

    if(typeof webDriverCustomLocation!=='undefined'){
      var service = new firefox.ServiceBuilder(webDriverCustomLocation);
      return await new Builder()
      .forBrowser("firefox")
      .setFirefoxService(service)
      .setFirefoxOptions(firefoxOptions)
      .build();
    }else{
      return await new Builder()
      .forBrowser("firefox")
      .setFirefoxOptions(firefoxOptions)
      .build();
    }    
  },
};

const envBrowser = process.env.BROWSER;

const browser =
  envBrowser && (envBrowser === "chrome" || envBrowser === "firefox")
    ? envBrowser
    : "chrome";

const getBrowserDriver = browserDriver[browser];

module.exports = getBrowserDriver;
