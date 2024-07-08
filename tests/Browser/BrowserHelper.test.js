const path = require("path")
const fs = require("fs")
const BrowserHelper = require("../../src/browsers/BrowserHelper.js");

describe('BrowserHelper', () => {
    test('should download chrome browser binary', async () => {
        var browserLocation = path.join(process.cwd(), ".chrome");
        if (fs.existsSync(browserLocation)) {
            await fs.promises.rm(browserLocation, { recursive: true });  
        }            
        var browserHelper = new BrowserHelper();
        var version = await browserHelper.getVersionByBuildId("chrome", "stable");
        var response = await browserHelper.downloadBrowserBinary("chrome", version);
        var exist = fs.existsSync(response.executableLocation);
        expect(exist).toBe(true)
    });

    test('should download chrome browser driver', async () => {
        var browserLocation = path.join(process.cwd(), ".chrome");
        if (fs.existsSync(browserLocation)) {
            await fs.promises.rm(browserLocation, { recursive: true });  
        }            
        var browserHelper = new BrowserHelper();
        var version = await browserHelper.getVersionByBuildId("chrome", "stable");
        var response = await browserHelper.downloadBrowserDriver("chrome", version);
        var exist = fs.existsSync(response.executableLocation);
        expect(exist).toBe(true)
    });  
});