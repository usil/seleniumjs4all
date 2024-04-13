const os = require("os");
const axios = require("axios");
const path = require("path");
const fs = require("fs");
const finder = require("find-package-json");
const https = require("https");
const extract = require("extract-zip");
const jp = require("jsonpath");

function BrowserHelper() {
  var metadata = {
    chrome: {
      stable: {
        queryVersionUrl:
          "https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions.json",
        jsonPathVersionExtract: "$.channels.Stable.version",
      },
      downloadUrlTemplate: {
        linux: {
          x64: {
            url: "https://storage.googleapis.com/chrome-for-testing-public/#version/linux64/chrome-linux64.zip",
            unpackedFolderName: "chrome-linux64",
          },
        },
      },
    },
    firefox: {
      stable: {
        queryVersionUrl:
          "https://product-details.mozilla.org/1.0/firefox_versions.json",
        jsonPathVersionExtract: "$.LATEST_FIREFOX_VERSION",
      },
      downloadUrlTemplate: {
        linux: {
          x64: {
            url: "https://ftp.mozilla.org/pub/firefox/releases/#version/linux-x86_64/en-US/firefox-#version.tar.bz2",
            unpackedFolderName: "firefox",
          }
        },
      },
    },
  };

  //https://product-details.mozilla.org/1.0/firefox_versions.json
  //LATEST_FIREFOX_VERSION
  //https://ftp.mozilla.org/pub/firefox/nightly/latest-mozilla-central/
  //https://archive.mozilla.org/pub/firefox/releases/119.0.1/win32/en-US/
  //https://archive.mozilla.org/pub/firefox/releases/124.0.2/linux-x86_64/en-US/
  //https://ftp.mozilla.org/pub/firefox/candidates/124.0.2-candidates/build1/win32/en-US/firefox-124.0.2.zip

  this.download = async (browser, buildId) => {
    var platform = os.platform();
    var arch = process.arch;
    try {
      metadata[browser][buildId]["queryVersionUrl"];
      metadata[browser]["downloadUrlTemplate"][platform][arch];
    } catch (error) {
      console.log(error);
      throw new Error(
        `Brower info was not found in metadata: platform: ${platform}, browser: ${browser}, buildId: ${buildId}. Allowed values: ${metadata}`
      );
    }
    return await download(platform, arch, browser, buildId);
  };

  async function download(platform, arch, browser, buildId) {
    var queryUrl = metadata[browser][buildId]["queryVersionUrl"];
    var axiosResponse = await axios.get(queryUrl);
    var version = jp.value(
      axiosResponse.data,
      metadata[browser][buildId]["jsonPathVersionExtract"]
    );
    console.log(version);
    var downloadUrl =
      metadata[browser]["downloadUrlTemplate"][platform][arch]["url"];
    downloadUrl = downloadUrl.replace("#version", version);
    console.log("browser to download: " + downloadUrl);

    var f = finder(__filename);
    var frameworkLocation = path.dirname(f.next().filename);
    var destinationBrowserFolder = path.join(frameworkLocation, `.${browser}`, version, platform, arch);

    if (!fs.existsSync(destinationBrowserFolder)) {
      await fs.promises.mkdir(destinationBrowserFolder, { recursive: true });
    }

    var zipDestination = path.join(destinationBrowserFolder, downloadUrl.split("/").pop());
    var unzipDestination = destinationBrowserFolder;
    await downloadFileFomrUrl(downloadUrl, zipDestination);
    await extract(zipDestination, { dir: unzipDestination });
    var unpackedFolderName =
      metadata[browser]["downloadUrlTemplate"][platform][arch][
        "unpackedFolderName"
      ];
    var binaryLocation = path.join(
      unzipDestination,
      unpackedFolderName,
      "chrome" + (platform == "win32" ? ".exe" : "")
    );
    console.log("Extraction complete. Binary location: " + binaryLocation);
    //delete the downloaded files (zip, etc)
    await fs.promises.rm(zipDestination, { recursive: true });  
    return {binaryLocation};
  }

  async function downloadFileFomrUrl(url, dest) {
    return new Promise((resolve, reject) => {
      var file = fs.createWriteStream(dest);
      https.get(url, function (response) {
        response.pipe(file);
        file.on("finish", function () {
          file.close();
          resolve();
        });
      });
    });
  }
}

module.exports = BrowserHelper;

console.log(require("os").platform());
