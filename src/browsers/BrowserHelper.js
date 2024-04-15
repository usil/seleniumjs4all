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
  this.metadata = {
    chrome: {
      stable: {
        queryVersionUrl:
          "https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions.json",
        jsonPathVersionExtract: "$.channels.Stable.version",
      },
      browserBinary : {
        downloadUrlTemplate: {
          Linux: {
            x64: {
              url: "https://storage.googleapis.com/chrome-for-testing-public/#version/linux64/chrome-linux64.zip",
              unpackedFolderName: "chrome-linux64",
              unpackedExecutableName: "chrome",
            },
          },
          Windows_NT: {
            x64: {
              url: "https://storage.googleapis.com/chrome-for-testing-public/#version/win64/chrome-win64.zip",
              unpackedFolderName: "chrome-win64",
              unpackedExecutableName: "chrome.exe",
            },
          },
        },        
      },
      browserDriver : {
        downloadUrlTemplate: {
          Linux: {
            x64: {
              url: "https://storage.googleapis.com/chrome-for-testing-public/#version/linux64/chromedriver-linux64.zip",
              unpackedFolderName: "chromedriver-linux64",
              unpackedExecutableName: "chromedriver",
            },
          },
          Windows_NT: {
            x64: {
              url: "https://storage.googleapis.com/chrome-for-testing-public/#version/win32/chromedriver-win64.zip",
              unpackedFolderName: "chromedriver-win64",
              unpackedExecutableName: "chromedriver.exe",
            },
          },
        },        
      }
    },
    firefox: {
      stable: {
        queryVersionUrl:
          "https://product-details.mozilla.org/1.0/firefox_versions.json",
        jsonPathVersionExtract: "$.LATEST_FIREFOX_VERSION",
      },
      downloadUrlTemplate: {
        Linux: {
          x64: {
            url: "https://ftp.mozilla.org/pub/firefox/releases/#version/linux-x86_64/en-US/firefox-#version.tar.bz2",
            unpackedFolderName: "firefox",
          },
        },
        Windows_NT: {
          x64: {
            url: "https://ftp.mozilla.org/pub/firefox/candidates/#version-candidates/build1/win32/en-US/firefox-#version.zip",
            unpackedFolderName: "firefox",
          },
        },
      },
    },
  };

  this.getVersionByBuildId = async (browser, buildId) => {
    var queryUrl = this.metadata[browser][buildId]["queryVersionUrl"];
    var jsonPathVersionExtract = this.metadata[browser][buildId]["jsonPathVersionExtract"]    
    var axiosResponse = await axios.get(queryUrl);
    var version = jp.value(
      axiosResponse.data,
      jsonPathVersionExtract
    );
    return version;
  }  

  this.downloadBrowserBinary = async (browser, version) => {
    var platform = os.type();
    var arch = process.arch;
    return await downloadFile(platform, arch, browser, version, this.metadata[browser]["browserBinary"]);
  };

  this.downloadBrowserDriver = async (browser, version) => {
    var platform = os.type();
    var arch = process.arch;
    return await downloadFile(platform, arch, browser, version, this.metadata[browser]["browserDriver"]);
  };

  async function downloadFile(platform, arch, browser, version, downloadMetadata) {
    
    var unpackedFolderName =  downloadMetadata["downloadUrlTemplate"][platform][arch]["unpackedFolderName"];
    var unpackedExecutableName =  downloadMetadata["downloadUrlTemplate"][platform][arch]["unpackedExecutableName"];
    var f = finder(__filename);
    var frameworkLocation = path.dirname(f.next().filename);
    var destinationBrowserFolder = path.join(
      frameworkLocation,
      `.${browser}`,
      version,
      platform,
      arch
    );
    var unpackDestination = destinationBrowserFolder;
    var executableLocation = path.join(
      unpackDestination,
      unpackedFolderName,
      unpackedExecutableName
    );

    if (fs.existsSync(executableLocation)) {
      console.log("Executable already exist: "+executableLocation);
      //@TODO: force deletion
      return { executableLocation };
    }    

    var downloadUrlTemplate =
    downloadMetadata["downloadUrlTemplate"][platform][arch]["url"];
  
    var downloadUrl = downloadUrlTemplate.replace(/#version/g, version);
    console.log(`Downloading ${unpackedFolderName} ${version} : ${downloadUrl}`);

    var compressedFileLocation = path.join(
      destinationBrowserFolder,
      downloadUrl.split("/").pop()
    );
    
    await downloadFileFomrUrl(downloadUrl, compressedFileLocation);

    if (compressedFileLocation.endsWith(".zip")) {
      await extract(compressedFileLocation, { dir: unpackDestination });
    } else if (compressedFileLocation.endsWith(".tar.bz2")) {
      await extractTar(compressedFileLocation, unpackDestination);
    } else {
      throw new Error("Unsupported file compression. Allowed: zip, .tar.bz2");
    }


    console.log("Extraction complete. File location: " + executableLocation);
    //delete the downloaded files (zip, etc)
    await fs.promises.rm(compressedFileLocation, { recursive: true });
    return { executableLocation };
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
      tarStream.on("error", reject);
      tarStream.on("finish", fulfill);
      const readStream = fs.createReadStream(tarPath);
      readStream.pipe(bzip()).pipe(tarStream);
    });
  }
}

module.exports = BrowserHelper;
