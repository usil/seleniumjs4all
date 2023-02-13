#!/usr/bin/env node

require("colors");
require("dotenv").config();

const Table = require("cli-table");
const os = require("os");
const { v4 } = require("uuid")
const { EnvSettings } = require("advanced-settings");
const util = require("util");
const Compresser = require ('./helpers/Compresser');
const Mailer = require ('./helpers/Mailer');
const finder = require('find-package-json');
const { formatVarsEnv, sortTestResults, createReportHTML } = require("./helpers/testHelpers");
const path = require("path");
const exec = util.promisify(require("child_process").exec);
const packPath = require("package-json-path");
const envSettings = new EnvSettings();
const compresser = new Compresser()
const mailer = new Mailer();


console.log(path.dirname(packPath((""))));

const rootPath = path.dirname(packPath(("")));
const testOptions = envSettings.loadJsonFileSync( path.join(rootPath,"testOptions.json"), "utf8");
const columnNames = testOptions.columnNames;
const reportMode = testOptions.reportMode;

/**
 *
 * @param {string | number} suiteIdentifier Test Suite Identifier
 * @param {number} virtualUser Test run number
 * @param {string} testUuid Running test identifier
 * @description Print the report table
 */
const createTable = (suiteIdentifier, virtualUser, testUuid) => {
  const jestOutput = require(path.join(rootPath, `${suiteIdentifier}-jest-output.json`));

  let date = new Date();

  console.info(
    `\n# ${virtualUser} Jest report : ${suiteIdentifier}\n`
      .yellow.bold
  );

  console.info(
    `Test uuid: ${testUuid}\n`
      .yellow.bold
  );

  console.info(
    `Test timestamp: ${date.toString()}\n`
      .yellow.bold
  );

  const tableHead = [];
  const colWidths = [];

  tableHead.push("#".blue);
  colWidths.push(5);

  columnNames.forEach((column, index) => {
    let columnWidth = 35;

    if (reportMode === "dynamicDeep")
      columnWidth = index !== 1 ? 35 : 50


    tableHead.push(`${column}`.blue);
    colWidths.push(columnWidth);
  });

  tableHead.push("Status".blue);
  colWidths.push(15);

  const table = new Table({
    head: [...tableHead],
    colWidths: [...colWidths],
    colors: true,
  }); //* Creates the table

  let testResultIndex = 0;

  let testResults = sortTestResults(jestOutput.testResults)

  for (const testResult of testResults) {
    const path =
      os.type() === "Windows_NT"
        ? testResult.name.split("\\")
        : testResult.name.split("/");

    const testIndex = path.indexOf("tests");

    if (testIndex === -1) {
      console.log(
        `${path[path.length - 1]} test is not inside the correct directory.`
          .yellow
      );
      testResultIndex++;
      continue;
    }

    let tableValues = path.slice(testIndex + 1, path.length);

    if (tableValues.length !== columnNames.length && reportMode !== 'dynamicDeep') {
      console.log(
        `${path[path.length - 1]} does not meet your columns definition.`.yellow
      );
    }

    /**
     * If the type of report is dynamic, adjust depth of folders in columns
     */
    if (reportMode === 'dynamicDeep') {
      let fixedColumns = [];

      /**
       * The first is always used for column 'C1'
       */

      fixedColumns.push((tableValues.length > 1 && columnNames.length > 1) ? tableValues.shift() : "");

      /**
       * Iterate and concatenate the folder to fixed
       */
      let dynamicColumn = ''
      for (let index = 0; index < tableValues.length - 1; index++) {
        index === 0 ? '' : dynamicColumn += '/';
        dynamicColumn += `${tableValues[index]}`
      }

      /**
       * Add the fixed column 'C2'
       */
      fixedColumns.push(dynamicColumn)
      
      /**
       * Add the value of the last column 'C3'
       */
      fixedColumns.push(tableValues.pop().split('.test')[0])

      // Replace table value
      tableValues = fixedColumns
    }

    const contentToPush = [];

    contentToPush.push((testResultIndex + 1).toString());

    for (let index = 0; index < columnNames.length; index++) {
      if (tableValues[index]) {
        contentToPush.push(tableValues[index]);
      } else {
        contentToPush.push("");
      }
    }

    contentToPush.push(
      testResult.status === "passed"
        ? testResult.status.green
        : testResult.status.red
    );

    table.push([...contentToPush]);
    testResultIndex++;
  } //* Inserts data to the table

  console.info(table.toString() + "\n"); //* Prints the table
};

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
          contentType: "application/javascript",
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
          .then((result) => {
            // Print the jest result
            console.info(result.stderr.blue);
          if (columnNames.length > 0) {
            createTable(suiteIdentifier, varToEnv.EXECUTION_SUITE, varToEnv.TEST_UUID);
            createReportHTML(suiteIdentifier, varToEnv.EXECUTION_SUITE, testOptions, varToEnv.TEST_UUID)
            .then( () => {
              if (process.env.SEND_REPORT === 'send') {
                compresser.run(resolveSourcePath, resolveSourcePath);
                mailer.sendMail(params);
              }
              });
            }
          })
          .catch((err) => {
            if (!err.killed) {
              // Print the jest result
              console.info(err.stderr.red);
              if (columnNames.length > 0) {
                createTable(suiteIdentifier, index, varToEnv.TEST_UUID);
                createReportHTML(suiteIdentifier, varToEnv.EXECUTION_SUITE, testOptions, varToEnv.TEST_UUID)
                .then(() => {
                  if (process.env.SEND_REPORT === 'send') {
                    compresser.run(resolveSourcePath, resolveSourcePath);
                    mailer.sendMail(params);
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
