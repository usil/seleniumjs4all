const fs = require('fs');
const archiver = require('archiver');

class Compresser {
    constructor() {}
    /**
     * 
     * @param {sourcePath} sourcePath string 
     * @param {destination} destination string
    */
    async run(sourcePath, destination ) {
        try {
            const output = fs.createWriteStream( destination+'.zip' );
            const archive = archiver('zip');
            output.on('close', function () {
                console.log(archive.pointer() + ' total bytes');
                console.log('archiver has been finalized and the output file descriptor has closed.');
            });
            archive.on('error', function(err){
                throw err;
            });
            archive.pipe(output);
            archive.directory(sourcePath, false);  
            archive.finalize();
            return true;
        } catch (error) {
            console.log(error)
            throw err;
        }        
    } 
}

module.exports = Compresser