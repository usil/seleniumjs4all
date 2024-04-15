#!/usr/bin/env node

require("colors");
require("dotenv").config();

const os = require("os");
const { v4 } = require("uuid")
const { EnvSettings } = require("advanced-settings");
const util = require("util");
const Compresser = require ('./helpers/Compresser');
const Mailer = require ('./helpers/Mailer');
const { formatVarsEnv, createReportHTML, createTable, getAllFilesFromDirectory, filterArrayByRegex } = require("./helpers/testHelpers");
const path = require("path");
const exec = util.promisify(require("child_process").exec);
const packPath = require("package-json-path");
const fs = require("fs");
const envSettings = new EnvSettings();
const compresser = new Compresser()
const mailer = new Mailer();


const rootPath = path.dirname(packPath(("")));
let testOptions
if (process.env.SETTINGS_CUSTOM_LOCATION && process.env.SETTINGS_CUSTOM_LOCATION != null) {
  testOptions = envSettings.loadJsonFileSync( process.env.SETTINGS_CUSTOM_LOCATION, "utf8");
} else {
  testOptions = envSettings.loadJsonFileSync( path.join(rootPath, "settings.json"), "utf8");
}
const columnNames = testOptions.columnNames;
const reportMode = testOptions.reportMode;
const smtpParams = testOptions.smtp;


/**
 * @description app entrypoint
 */
const main = () => {

  for (
    let index = 0;
    index < (testOptions.virtualUserMultiplier || 1);
    index++
  ) {
    for (const suite of testOptions.virtualUserSuites) {
      if (!suite.skip) {
        const suiteIdentifier = suite.identifier
          ? suite.identifier
          : index;

        console.info(
          `#${index} Starting test in ${suiteIdentifier} suite`.bgMagenta
        );
        if (
          (testOptions.filterByTestName && testOptions.filterByRegexTestName) || 
          (suite.filterByTestName && testOptions.filterByRegexTestName) ||
          (suite.filterByRegexTestName && testOptions.filterByTestName) ||
          (suite.filterByRegexTestName && suite.filterByTestName) || 
          (process.env.FILTER_BY_REGEX_TEST_NAME && testOptions.filterByTestName) ||
          (process.env.FILTER_BY_REGEX_TEST_NAME && suite.filterByTestName) || 
          (process.env.FILTER_BY_REGEX_TEST_NAME && process.env.FILTERED_FILES) || 
          (process.env.FILTERED_FILES && testOptions.filterByRegexTestName) ||
          (process.env.FILTERED_FILES && suite.filterByRegexTestName)

        )  {
          console.log("Error: filterByTestName and filterByRegexTestName are mutually exclusive")
          return "";
        }

        let testFiles = [];
        if (testOptions.filterByTestName || suite.filterByTestName || process.env.FILTERED_FILES) {
          const environmentTestFiles = process.env.FILTERED_FILES
            ? process.env.FILTERED_FILES.toString().split(" ")
            : [];
          const suiteTestFiles = suite.filterByTestName || [];
          const globalTestFiles = testOptions.filterByTestName || [];
          testFiles =
            environmentTestFiles.length > 0
              ? environmentTestFiles
              : suiteTestFiles.length > 0
                ? suiteTestFiles
                : globalTestFiles;
        } else if (testOptions.filterByRegexTestName || suite.filterByRegexTestName || process.env.FILTER_BY_REGEX_TEST_NAME) {
            const environmentFilterFilesByRegex = process.env.FILTER_BY_REGEX_TEST_NAME
              ? process.env.FILTER_BY_REGEX_TEST_NAME.toString().split(" ")
              : [];
            const suiteFilterByRegexTestName = suite.filterByRegexTestName || [];
            const globalFilterByRegexTestName = testOptions.filterByRegexTestName || [];
            const finalFilterRegex = environmentFilterFilesByRegex.length > 0
            ? environmentFilterFilesByRegex
            : suiteFilterByRegexTestName.length > 0
              ? suiteFilterByRegexTestName
              : globalFilterByRegexTestName;
            const testsDirectoryPath = path.join(rootPath, "tests");
            
            const allFilesToTest = getAllFilesFromDirectory(testsDirectoryPath, ".test.js") || [];
            
            testFiles = filterArrayByRegex(allFilesToTest, finalFilterRegex);

            if (testFiles.length < 1) {
              console.log("No test files matching with ", finalFilterRegex)
            }
          }
        
        // exclude files for tests
        const environmentExcludeTestFiles = process.env.EXCLUDE_FILES
          ? process.env.EXCLUDE_FILES.toString().split(" ")
          : [];
        const suiteExcludeTestFiles = suite.excludeFiles || [];
        const globalExcludeTestFiles = testOptions.excludeFiles || [];
        const exclueTestFiles =
          environmentExcludeTestFiles.length > 0
            ? environmentExcludeTestFiles
            : suiteExcludeTestFiles.length > 0
              ? suiteExcludeTestFiles
              : globalExcludeTestFiles;


        console.log("included tests: ", testFiles.join(" "));
        console.log("excluded tests: ", exclueTestFiles.join(" "));

        // Format variables for environment variables
        let varToEnv = formatVarsEnv(suite.variables)

        varToEnv = {...varToEnv, ...process.env}

        /**
         * When not in windows, the path is added
         */
        if (os.type() === 'Windows_NT') {
          delete varToEnv.PATH
        }

        /**
         * Generate id for test
         */
        varToEnv.TEST_UUID = v4();
        varToEnv.EXECUTION_SUITE = index;

        let resolveSourcePath = path.join( rootPath, 'report/', varToEnv.TEST_UUID );
        let indexResolvePath = path.resolve(rootPath, 'report', varToEnv.TEST_UUID, varToEnv.EXECUTION_SUITE.toString(), "index.html");
        const params = {
          filename: varToEnv.TEST_UUID,
          sourcePath: resolveSourcePath + '.zip',
          suiteIdentifier:suiteIdentifier,
        }
        //* Spawns the jest process
        exec(
          `npx jest --verbose --json --runInBand --outputFile=${suiteIdentifier}-jest-output.json ${testFiles.join(
            " "
          )} --testPathIgnorePatterns=${exclueTestFiles.join(" ")}`,
          {
            env: { ...varToEnv },
          }
        )
          .then(async (result) => {
            // Print the jest result
            console.info(result.stderr.blue);
          if (columnNames.length > 0) {
            const tableCreated = await createTable(suiteIdentifier, varToEnv.EXECUTION_SUITE, varToEnv.TEST_UUID, rootPath, columnNames, reportMode);
            console.info(tableCreated.toString() + "\n"); //* Prints the table
            createReportHTML(suiteIdentifier, varToEnv.EXECUTION_SUITE, testOptions, varToEnv.TEST_UUID, rootPath)
            .then( async () => {
              if (smtpParams?.enableSmtpNotification == true && smtpParams?.disableMailNotificationOnSuccess != true) {
                compresser.run(resolveSourcePath, resolveSourcePath);
                let titleBody ="<p> No errors detected in tests for " +  `<b>${suiteIdentifier}.</b> <p>\n`;
                const bodyHtmlReport = await mailer.createTableHtmlToReportMailer(indexResolvePath, titleBody);
                mailer.sendMail(params, varToEnv.TEST_UUID, "Success", bodyHtmlReport, smtpParams, "\u{1f600}", smtpParams?.customEmailSubjectPattern ?? null);
              }
            });
            }
          })
          .catch(async (err) => {
            if (!err.killed) {
              // Print the jest result
              console.info(err.stderr.red);
              if (columnNames.length > 0) {
                const tableCreated = await createTable(suiteIdentifier, index, varToEnv.TEST_UUID, rootPath, columnNames, reportMode);
                console.info(tableCreated.toString() + "\n"); //* Prints the table
                createReportHTML(suiteIdentifier, varToEnv.EXECUTION_SUITE, testOptions, varToEnv.TEST_UUID, rootPath)
                .then(async () => {
                  if (smtpParams?.enableSmtpNotification == true) {
                    compresser.run(resolveSourcePath, resolveSourcePath);
                    let titleBody = "<p>Errors have been detected in at least one test for " + `<b>${suiteIdentifier}.</b> Review the attached html report by opening it in your preferred browser.</p>\n`;
                    const bodyHtmlReport = await mailer.createTableHtmlToReportMailer(indexResolvePath, titleBody);
                    mailer.sendMail(params, varToEnv.TEST_UUID, "Failed", bodyHtmlReport, smtpParams, "\uD83D\uDE21", smtpParams?.customEmailSubjectPattern ?? null);
                  }
                });
              }
            } else {
              console.error("error".red, err);
            }
          });
      }
    }
  }
};

main();
