# seleniumjs4all

<!-- <img src="./badges/badge-branches.svg">
<img src="./badges/badge-functions.svg">
<img src="./badges/badge-lines.svg">
<img src="./badges/badge-statements.svg"> -->


![](./badges/badge-branches.svg) ![](./badges/badge-functions.svg) ![](./badges/badge-lines.svg) ![](./badges/badge-statements.svg)




## Description

This is a library to contains diferents functions.

## Requirements

- nodejs >= 16
- chrome or firefox. More details here: https://github.com/usil/selenium-nodejs-starter/wiki/Supported-Browsers

This will give a your a report like this

![image](https://user-images.githubusercontent.com/3322836/200095302-3f7c81d9-239e-41c7-bfd9-36ccdb5203dd.png)

Or a web report

![image](https://user-images.githubusercontent.com/3322836/200892976-c2c0ad2c-a5a3-4c33-bb21-23de94e64316.png)

## Steps

```list
- Create a browserOptions.json
- Create a testOptions.json
```

## Advanced Configurations

### testOptions.json

You will have a `testOptions.json` file in the root of this project, you should only change the variables inside `virtualUserSuites`. You can also limit the files to test in the `filterByTestName` arrays setting the name of the tests files that you want to test.

| name                  | Description                                                                                                                                         | Default Value          | Required |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | -------- |
| filterByTestName                 | The files or directory that you want to test, setting it to an empty array will test all files                                                      | []                     | false    |
| reportWeb             | Generate report on Web(HTML)                                                                                                                        | false                  | true     |
| reportMode            | Change the type of report keeping its default structure or adjusting the report columns                                                             | staticDeep             | true     |
| columnNames           | The name of the columns that will be related to the directory structure                                                                             | []                     | true     |
| virtualUserSuites     | The number of whole test suites you want to simulate and its specific configurations and variables, each test virtual user suite represents 1 user. | virtualUserSuite array | true     |
| virtualUserMultiplier | If you want to execute more users. It multiplies the virtualUserSuites.                                                                             | 1                      | false    |

A `virtualUserSuite` object has the following properties:

| name       | Description                                                                       | Default Value                             | Required |
| ---------- | --------------------------------------------------------------------------------- | ----------------------------------------- | -------- |
| identifier | An identifier for this test suite                                                 | Will default to the position in the array | true     |
| skip       | The app will skip this test suite                                                 | false                                     | false    |
| filterByTestName      | If the length of the array is more than 0 will overwrite the global files options | []                                        | false    |
| variables  | Global variables for all of the test of this suite                                | null                                      | false    |

Example of an empty `testOptions.json` file

```json
{
  "filterByTestName": [],
  "virtualUserMultiplier": 1,
  "reportWeb": false,
  "reportMode": "staticDeep",
  "columnNames": ["enterprise", "feature", "scenario"],
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

> In case sensitive data is required, it can be obtained directly from the environment variables

Example in `testOptions.json` file

```json
{
  "filterByTestName": [],
  "virtualUserMultiplier": 1,
  "reportWeb":true,
  "reportMode": "staticDeep",
  "columnNames": ["enterprise", "feature", "scenario"],
  "smtp": {
    "enableSmtpNotification": "${ENABLE_SMTP_NOTIFICATION}",
    "disableMailNotificationOnSuccess": "${DISABLE_MAIL_NOTIFICATION_ON_SUCCESS}",
    "smtpHost": "${SMTP_HOST}",
    "smtpPort": "${SMTP_PORT}",
    "smtpUser": "${SMTP_USER}",
    "smtpPassword": "${SMTP_PASSWORD}",
    "smtpSecure": "${SMTP_SECURE}",
    "smtpTlsCiphers": "${SMTP_TLS_CIPHERS}",
    "smtpSenderDisplayname": "${SMTP_SENDER_DISPLAYNAME}",
    "smtpRecipients": "${SMTP_RECIPIENTS}"
  },
  "virtualUserSuites": [
    {
      "skip": false,
      "identifier": "first-test",
      "filterByTestName": [],
      "variables": {
        "acmeBaseUrl": "https://acme.com",
        "acmeApiKey": "${API_KEY}"
      }
    }
  ]
}

```

Just expose or inject them before the test execution. Linux sample:

```
export API_KEY="changeme"
```

### browserOptions.json

You will have a `browserOptions.json` file in the root of this project. Where you can add or remove the options of the browser that selenium executes. Most of those variables should not be touched unless you know what you are doing. The `--headless` option can be removed to not run in it a non headless mode.

```json
{
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

### Shell variables

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

### Custom columns

By default this framework only prints 3 columns. If you need to have more columns visit [Settings Shell Report](https://github.com/usil/selenium-nodejs-starter/wiki/Settings---Shell--Report#how-to-use-reportmode) and use the **defaultMode**

<br>
<br>


# Send Report for Mail

| Variable                             | Description                                    | Default Value |
| ------------------------------------ | ---------------------------------------------- | ------------- |
| ENABLE_SMTP_NOTIFICATION                  | If you want to send mail with report, this variable should be equals to <b>true</b>               |           |
| DISABLE_MAIL_NOTIFICATION_ON_SUCCESS                  | If the test result is successful and this parameter is equal to <b>true</b>, the report will not be mailed.               |           |
| SMTP_HOST                   | Sender identifier               |           |
| SMTP_PORT                   | Communication endpoint that defines the routing of email transactions               |           |
| SMTP_USER                   | User of your mail server               |            |
| SMTP_PASSWORD                   | Password of your mail server               |           |
| SMTP_SECURE                   | Encrypt. <br> If your host is for gmail, your value should be true. <br> If your host is for office 365, your value should be false               | true           |
| SMTP_TLS_CIPHERS                   | Are algorithms that help secure network connections that use Transport Layer Security               |    SSLv3        |
| SMTP_SENDER_DISPLAYNAME                   | It is the alias of the transmitter           |            |
| SMTP_RECIPIENTS                   | Recipient report for mail, It can be multiple and separated by  '', ''            |            |


***Example***

```bash
export ENABLE_SMTP_NOTIFICATION=true
export DISABLE_MAIL_NOTIFICATION_ON_SUCCESS=false
export SMTP_HOST=smtp.chageme.com
export SMTP_PORT=465
export SMTP_USER=changeme@server
export SMTP_PASSWORD=changeme
export SMTP_SECURE=true
export SMTP_TLS_CIPHERS=SSLv3
export SMTP_RECIPIENTS=recipient@server
```

## Custom subject on report by mail

This is a framework feature to customize the subject of the emailed report. More information in the next link https://github.com/usil/seleniumjs4all/wiki/Send-report-by-mail#custom-subject-on-report-by-mail

<br>

## Contributors

<table>
  <tbody>
    <td>
      <img src="https://avatars.githubusercontent.com/u/66818290?s=400&u=d2f95a7497efd7fa830cf96fc2dc01120f27f3c5&v=4" width="100px;"/>
      <br />
      <label><a href="https://github.com/iSkyNavy">Diego Ramos</a></label>
      <br />
    </td>
    <td>
      <img src="https://avatars0.githubusercontent.com/u/3322836?s=460&v=4" width="100px;"/>
      <br />
      <label><a href="http://jrichardsz.github.io/">JRichardsz</a></label>
      <br />
    </td>
  </tbody>
</table>