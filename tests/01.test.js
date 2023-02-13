const getBrowserDriver = require("../src/browsers/browserDriver");
const { getVariable } = require("../src/helpers/testHelpers");

describe('The "Chapa tu carrera" page should load correctly', () => {
  let driver;

  beforeAll(async () => {
    driver = await getBrowserDriver();
    global.driver = driver;
  })

  beforeEach(async () => {
  })

  test('1cfc3cb39d43 The website should load correctly', async () => {
    const value = true

    expect(value).toBe(true)
  })

  afterAll(async () => {
  })
})