const { handleTestIds } = require("../../src/helpers/testHelpers");

describe('Handle test ids', () => {
    test('should return id when put correct syntax in title', () => {
        const title = "[dfdca452f210] - Debe mostrar el search en el inicio"
        const resp = handleTestIds(title);
        expect(resp).toBe("dfdca452f210")
    });
    test('should return undefined when put incorrect syntax in title', () => {
        const title = "Debe mostrar el search en el inicio"
        const resp = handleTestIds(title);
        expect(resp).toBe(undefined)
    });
});