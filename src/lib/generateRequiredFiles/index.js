#!/usr/bin/env node

const path = require('path');
const packPath = require("package-json-path");
const { readingFile } = require("../../helpers/testHelpers")


const rootPath = path.dirname(packPath(("")));

const browserOptionsPath = path.join(rootPath, "browserOptions.json");
const testOptionsPath = path.join(rootPath, "settings.json");

console.log('Preparing files...');

const dataBrowserOptions = '{ "options" : { "addArguments": [ "--log-level=1", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage", "--headless", "--window-size=2200,1600" ]}}';
const dataTestOptions = '{"filterByTestName":[],"excludeFiles":[],"virtualUserMultiplier":1,"reportWeb":true,"reportMode":"dynamicDeep","columnNames":["enterprise","feature","scenario"],"smtp":{"enableSmtpNotification":"${ENABLE_SMTP_NOTIFICATION}","disableMailNotificationOnSuccess":"${DISABLE_MAIL_NOTIFICATION_ON_SUCCESS}","smtpHost":"${SMTP_HOST}","smtpPort":"${SMTP_PORT}","smtpUser":"${SMTP_USER}","smtpPassword":"${SMTP_PASSWORD}","smtpSecure":"${SMTP_SECURE}","smtpTlsCiphers":"${SMTP_TLS_CIPHERS}","smtpSenderDisplayname":"${SMTP_SENDER_DISPLAYNAME}","smtpRecipients":"${SMTP_RECIPIENTS}"},"virtualUserSuites":[{"skip":false,"identifier":"first-run","variables":{}}]}';
readingFile("", dataBrowserOptions, browserOptionsPath);
readingFile("", dataTestOptions, testOptionsPath);
