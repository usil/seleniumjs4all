const getBrowserDriver = require("../../src/browsers/browserDriver");

describe('Browser', () => {
    test.only('should return the default browser when not exist the enviroment variable', async () => {
        const driver = await getBrowserDriver();
        expect(driver).toBeTruthy();
    });
});