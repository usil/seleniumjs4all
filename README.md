# seleniumjs4all

![](./badges/badge-branches.svg) ![](./badges/badge-functions.svg) ![](./badges/badge-lines.svg) ![](./badges/badge-statements.svg)

## Description

Framework that encapsulates the complexity of browser, driver and selenium configurations. Also adds some useful features like:

- Automatic screenshot on error
- Shell report
- Html report 
- Send report by mail
- Secrets

## Requirements

- nodejs >= 16
- chrome or firefox. More details here: https://github.com/usil/selenium-nodejs-starter/wiki/Supported-Browsers

This will give a your a report like this

![image](https://user-images.githubusercontent.com/3322836/200095302-3f7c81d9-239e-41c7-bfd9-36ccdb5203dd.png)

Or a web report

![image](https://user-images.githubusercontent.com/3322836/200892976-c2c0ad2c-a5a3-4c33-bb21-23de94e64316.png)

## Demo

Clone this repository https://github.com/usil/seleniumjs4all-demo and follow its readme.md

## Settings


This file centralize the configurations for all your tests and the framework. Also you can use secrets with envrionment variables

**Global configurations**

```json
{
  "filterByTestName": [],
  "virtualUserMultiplier": 1,
  "reportWeb": false,
  "reportMode": "staticDeep",
  "columnNames": ["enterprise", "feature", "scenario"]
}
```

| name | Description | Default Value | Required |
|:--|:--|:--|:--|
| filterByTestName | The files or directory that you want to test, setting it to an empty array will test all files | [] | false |
| filterByRegexTestName | Same of filterByTestName but with regex| [] | false |
| reportWeb | Generate report on Web(HTML) | false | true |
| reportMode | Change the type of report keeping its default structure or adjusting the report columns | staticDeep | true     |
| columnNames | The name of the columns that will be related to the directory structure | [] | true | 
| virtualUserMultiplier | If you want to execute more users. It multiplies the virtualUserSuites. | 1 | false |

**browserOptions**

In this section you can pass custom options to the browser that will be used by selenium. Most of those variables should not be touched unless you know what you are doing. The `--headless` option can be removed to not run in it a non headless mode or "see as human" how automation moves your browser

```json
"browserSettings": {
  "options" : {
    "addArguments": [
      "--log-level=1",
      "--no-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--headless",
      "--window-size=2200,1600"
    ]
  }
}
```

| name | Description | Sample Value | Required |
|:--|:--|:--|:--|
| browserSettings.options.addArguments | Wellknown parameters to customize your browser. Simple string array. | [] | false |
| browserSettings.options.setChromeBinaryPath | Full location of the **Chrome** browser executable (not the driver). | C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe | false |
| browserSettings.options.setBinary | Full location of the **Chrome** browser executable (not the driver). | C:\\Program Files\\Mozilla Firefox\\firefox.exe | false |
| browserSettings.webDriverAbsoluteLocation | Full location of the web driver(not the browser). | /opt/driver/geckodriver | false |

If you have problems with the chrome binary or chrome driver location, check:

- https://github.com/usil/seleniumjs4all/wiki/This_version_of_ChromeDriver_only_supports
- https://github.com/usil/seleniumjs4all/wiki/Unknown_error_cannot_find_chrome_binary

**virtualUserSuite**

In this section you can add variables to be used at the unit test level.

| name       | Description                                                                       | Default Value                             | Required |
| ---------- | --------------------------------------------------------------------------------- | ----------------------------------------- | -------- |
| virtualUserSuites     | The number of whole test suites you want to simulate and its specific configurations and variables, each test virtual user suite represents 1 user. | virtualUserSuite array | true     |
| virtualUserSuites[0].identifier | An identifier for this test suite                                                 | Will default to the position in the array | true     |
| virtualUserSuites[0].skip       | The app will skip this test suite                                                 | false                                     | false    |
| virtualUserSuites[0].variables  | Global variables for all of the test of this suite                                | 
| virtualUserSuites[0].filterByTestName  |  The files or directory that you want to test| null                                      | false    |null                                      | false    |


```json
{
  "virtualUserSuites": [
    {
      "skip": false,
      "identifier": "first-test",
      "filterByTestName": [],
      "variables": {
        "acmeBaseUrl": "https://acme.com"
      }
    }
  ]
}
```

**Mail settings**

Useful if you want to enable an email generation with the html report attached.

```json
{
  "smtp": {
    "enableSmtpNotification": "true",
    "disableMailNotificationOnSuccess": "true",
    "smtpHost": "10.10.20.30",
    "smtpPort": "587",
    "smtpUser": "admin",
    "smtpPassword": "changeme",
    "smtpSecure": "true",
    "smtpTlsCiphers": "SSLv3",
    "smtpSenderDisplayname": "a custom alias of sender",
    "smtpRecipients": "jane@acme.com"
  }
}
```

| Variable                             | Description                                    | Default Value |
| ------------------------------------ | ---------------------------------------------- | ------------- |
| enableSmtpNotification                  | If you want to send mail with report, this variable should be equals to <b>true</b>               |           |
| disableMailNotificationOnSuccess                  | If the test result is successful and this parameter is equal to <b>true</b>, the report will not be mailed.               |           |
| smtpHost                   | Sender identifier               |           |
| smtpPort                   | Communication endpoint that defines the routing of email transactions               |           |
| smtpUser                   | User of your mail server               |            |
| smtpPassword                   | Password of your mail server               |           |
| smtpSecure                   | Encrypt. <br> If your host is for gmail, your value should be true. <br> If your host is for office 365, your value should be false               | true           |
| smtpTlsCiphers                   | Are algorithms that help secure network connections that use Transport Layer Security               |    SSLv3        |
| smtpSenderDisplayname                   | It is the alias of the transmitter           |            |
| smtpRecipients                   | Recipient report for mail, It can be multiple and separated by  '', ''            |            |


**Shell variables**

You can overwrite the files option adding `FILTERED_FILES` to your environment variables, separating the files or directories by an space.

In an .env file:

```text
FILTERED_FILES = test1.test.js test2.test.js
```

In linux:

```cmd
export FILTERED_FILES="test1.test.js test2.test.js"
```

In windows:

```cmd
set FILTERED_FILES="test1.test.js test2.test.js"
```

**External settings**

You can have a settings.json outside of the workspace. Check [this](https://github.com/usil/seleniumjs4all/wiki/Custom_settings_location)


## More settings

Check the wiki https://github.com/usil/seleniumjs4all/wiki

<br>

## Contributors

<table>
  <tbody>

  <td align="center"><a href="http://jrichardsz.github.io"><img src="https://avatars0.githubusercontent.com/u/3322836?s=460&v=4" width="100px;" alt=""/><br /><sub><b>JRichardsz</b></sub></a></td>  


  <td align="center"><a href="https://github.com/iSkyNavy"><img src="https://avatars.githubusercontent.com/u/66818290?s=400&v=4" width="100px;" alt=""/><br /><sub><b>Diego Ramos</b></sub></a></td>  

  </tbody>
</table>