import fs from 'fs';
import { exec } from 'child_process';
import AdmZip from 'adm-zip';
import extract from 'extract-zip';
import tar from 'tar';
import zlib from 'zlib';
import unrarp from 'unrar-promise';
import { fullArchive } from 'node-7z-archive';

function extractZip(filePath, folderName, foldersCondition, pathDirectory) {
    if (foldersCondition) {
        const zip = new AdmZip(filePath);
        zip.extractAllTo(`${pathDirectory}/${folderName}/${file.split('.')[0]}`, true);
    } else {
        extract(filePath, { dir: `${pathDirectory}/${folderName}` });
    }
}

function extract7z(filePath, folderName, foldersCondition, pathDirectory) {
    if (foldersCondition) {
        fullArchive(filePath, `${pathDirectory}/${folderName}/${file.split('.')[0]}`, { p: 'password' })
        .progress((files) => {
            console.log(`Some files are extracted: ${files}`);
        })
        .then(() => {
            console.log('Extracting done!');
        })
        .catch((err) => {
            console.error(err);
        });
    } else {
        exec(`7z x ${filePath} -o${pathDirectory}/${folderName}`);
    }
}

function extractRar(filePath, folderName, foldersCondition, pathDirectory) {
    if (foldersCondition) {
        unrarp.extractAll(filePath, `${pathDirectory}/${folderName}/${file.split('.')[0]}`)
        .then((result) => {
            console.log(result);
        })
        .catch((err) => {
            console.error(err);
        });
    } else {
        exec(`unrar x ${filePath} ${pathDirectory}/${folderName}`);
    }
}

function extractGz(filePath, folderName, foldersCondition, pathDirectory) {
    if (foldersCondition) {
        const gunzip = zlib.createGunzip();
        const readStream = fs.createReadStream(filePath);
        const writeStream = fs.createWriteStream(`${pathDirectory}/${folderName}/${file.split('.')[0]}`);
        readStream.pipe(gunzip).pipe(writeStream);
    } else {
        tar.x({ file: filePath, cwd: `${pathDirectory}/${folderName}` });
    }
}

function unzipArchives(folderName, foldersCondition, pathDirectory) {
    fs.readdir(pathDirectory, (err, files) => {
        if (err) throw err;

        // Create new folder
        fs.mkdir(`${pathDirectory}/${folderName}`, (err) => {
        if (err) throw err;
        });

        // Loop through archive files
        files.forEach((file) => {
        const fileExtension = file.split('.').pop();

        // Check if file is an archive
        if (['zip', 'jar', '7z', 'rar', 'gz'].includes(fileExtension)) {
            const filePath = `${pathDirectory}/${file}`;

            // Check if file is a known archive format
            if (fileExtension === 'zip') {
            extractZip(filePath, folderName, foldersCondition, pathDirectory);
            } else if (fileExtension === '7z') {
            extract7z(filePath, folderName, foldersCondition, pathDirectory);
            } else if (fileExtension === 'rar') {
            extractRar(filePath, folderName, foldersCondition, pathDirectory);
            } else if (fileExtension === 'gz') {
            extractGz(filePath, folderName, foldersCondition, pathDirectory);
            }
        }
        });

        console.log('folders unzipped');
    });
}

unzipArchives('bitrix', false, 'C:\\files')