const path = require("path")
const fs = require("fs")
const BrowserHelper = require("../../src/browsers/BrowserHelper.js");

describe('BrowserHelper', () => {
    test('should download chrome binary', async () => {
        var browserLocation = path.join(process.cwd(), ".chrome");
        if (fs.existsSync(browserLocation)) {
            await fs.promises.rm(browserLocation, { recursive: true });  
        }            
        var browserHelper = new BrowserHelper();
        var response = await browserHelper.downloadBrowser("chrome", "stable");
        var exist = fs.existsSync(response.binaryLocation);
        expect(exist).toBe(true)
    });

    test('should download firefox binary', async () => {
        var browserLocation = path.join(process.cwd(), ".firefox");
        if (fs.existsSync(browserLocation)) {
            await fs.promises.rm(browserLocation, { recursive: true });  
        }  
        var browserHelper = new BrowserHelper();
        var response = await browserHelper.downloadBrowser("firefox", "stable");
        var exist = fs.existsSync(response.binaryLocation);
        expect(exist).toBe(true)
    });    
});