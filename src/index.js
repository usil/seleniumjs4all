#!/usr/bin/env node

require("colors");
require("dotenv").config();

const os = require("os");
const { v4 } = require("uuid")
const { EnvSettings } = require("advanced-settings");
const util = require("util");
const Compresser = require ('./helpers/Compresser');
const Mailer = require ('./helpers/Mailer');
const { formatVarsEnv, createReportHTML, createTable } = require("./helpers/testHelpers");
const path = require("path");
const exec = util.promisify(require("child_process").exec);
const packPath = require("package-json-path");
const envSettings = new EnvSettings();
const compresser = new Compresser()
const mailer = new Mailer();


const rootPath = path.dirname(packPath(("")));
const testOptions = envSettings.loadJsonFileSync( path.join(rootPath, "testOptions.json"), "utf8");
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

        const environmentTestFiles = process.env.FILTERED_FILES
          ? process.env.FILTERED_FILES.toString().split(" ")
          : [];

        const suiteTestFiles = suite.files || [];

        const globalTestFiles = testOptions.files || [];

        const testFiles =
          environmentTestFiles.length > 0
            ? environmentTestFiles
            : suiteTestFiles.length > 0
              ? suiteTestFiles
              : globalTestFiles;

        console.log(testFiles.join(" "));

        // Format variables for environment variables
        let varToEnv = formatVarsEnv(suite.variables)

        /**
         * When not in windows, the path is added
         */
        if (os.type() !== 'Windows_NT') {
          varToEnv.PATH = process.env.PATH
        }

        /**
         * Generate id for test
         */
        varToEnv.TEST_UUID = v4();
        varToEnv.EXECUTION_SUITE = index;

        let resolveSourcePath = path.join( rootPath, 'report/', varToEnv.TEST_UUID );
        const params = {
          filename: varToEnv.TEST_UUID,
          sourcePath: resolveSourcePath + '.zip',
        }
        //* Spawns the jest process
        exec(
          `npx jest --verbose --json --runInBand --outputFile=${suiteIdentifier}-jest-output.json ${testFiles.join(
            " "
          )}`,
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
            .then( () => {
              if (smtpParams?.smtpSendReport === 'send') {
                compresser.run(resolveSourcePath, resolveSourcePath);
                mailer.sendMail(params, varToEnv.TEST_UUID, "Success", "No errors detected in tests for " + `${suiteIdentifier}.`, smtpParams);
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
                .then(() => {
                  if (smtpParams?.smtpSendReport === 'send') {
                    compresser.run(resolveSourcePath, resolveSourcePath);
                    mailer.sendMail(params, varToEnv.TEST_UUID, "Failed", "Errors have been detected in at least one test for " + `${suiteIdentifier}. Review the attached html report by opening it in your preferred browser.`, smtpParams);
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
