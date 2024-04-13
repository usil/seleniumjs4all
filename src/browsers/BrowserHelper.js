const os = require("os");
const axios = require("axios");
const path = require("path");
const fs = require("fs");
const finder = require("find-package-json");
const https = require("https");
const extract = require("extract-zip");
const jp = require("jsonpath");
const tar = require("tar-fs");
const bzip = require("unbzip2-stream");

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
        win32: {
          x64: {
            url: "https://storage.googleapis.com/chrome-for-testing-public/#version/win64/chrome-win64.zip",
            unpackedFolderName: "chrome-win64",
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
          },
        },
        win32: {
          x64: {
            url: "https://ftp.mozilla.org/pub/firefox/candidates/#version-candidates/build1/win32/en-US/firefox-#version.zip",
            unpackedFolderName: "firefox",
          },
        },
      },
    },
  };

  this.downloadBrowser = async (browser, buildId) => {
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
    downloadUrl = downloadUrl.replace(/#version/g, version);
    console.log("browser to download: " + downloadUrl);

    var f = finder(__filename);
    var frameworkLocation = path.dirname(f.next().filename);
    var destinationBrowserFolder = path.join(
      frameworkLocation,
      `.${browser}`,
      version,
      platform,
      arch
    );

    if (!fs.existsSync(destinationBrowserFolder)) {
      await fs.promises.mkdir(destinationBrowserFolder, { recursive: true });
    }

    var compressedFileLocation = path.join(
      destinationBrowserFolder,
      downloadUrl.split("/").pop()
    );
    var unpackDestination = destinationBrowserFolder;
    await downloadFileFomrUrl(downloadUrl, compressedFileLocation);
    
    if(compressedFileLocation.endsWith(".zip")){
        await extract(compressedFileLocation, { dir: unpackDestination });
    }else if(compressedFileLocation.endsWith(".tar.bz2")){
        await extractTar(compressedFileLocation, unpackDestination);
    }else{
        throw new Error("Unsupported file compression. Allowed: zip, .tar.bz2");
    }

    var unpackedFolderName =
      metadata[browser]["downloadUrlTemplate"][platform][arch][
        "unpackedFolderName"
      ];
    var binaryLocation = path.join(
      unpackDestination,
      unpackedFolderName,
      browser + (platform == "win32" ? ".exe" : "")
    );
    console.log("Extraction complete. Binary location: " + binaryLocation);
    //delete the downloaded files (zip, etc)
    await fs.promises.rm(compressedFileLocation, { recursive: true });
    return { binaryLocation };
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

  async function extractTar(tarPath, folderPath) {
    return new Promise((fulfill, reject) => {
      const tarStream = tar.extract(folderPath);
      tarStream.on('error', reject);
      tarStream.on('finish', fulfill);
      const readStream = fs.createReadStream(tarPath);
      readStream.pipe(bzip()).pipe(tarStream);
    });
  }  
}

module.exports = BrowserHelper;

console.log(require("os").platform());
