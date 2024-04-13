const path = require("path")
const fs = require("fs")
const BrowserHelper = require("../../src/browsers/BrowserHelper.js");

describe('BrowserHelper', () => {
    test.only('should download chrome binary', async () => {

        await fs.promises.rm(path.join(process.cwd(), ".chrome"), { recursive: true });  
        var browserHelper = new BrowserHelper();
        var response = await browserHelper.download("chrome", "stable");
        var exist = fs.existsSync(response.binaryLocation);
        expect(exist).toBe(true)
    });
});