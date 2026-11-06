
const fs = require('fs');
const path = require('path');
const JsConfuser = require('js-confuser');

function getAllJsFiles(dirPath, arrayOfFiles = []) {
    const ignored = [
        'node_modules',
        '.git',
        '.github',
        'builder',
        'build',
        'dist'
    ];

    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
        if (ignored.includes(file)) return;

        const fullPath = path.join(dirPath, file);

        if (fs.statSync(fullPath).isDirectory()) {
            getAllJsFiles(fullPath, arrayOfFiles);
        } else if (file.endsWith('.js')) {
            arrayOfFiles.push(fullPath);
        }
    });

    return arrayOfFiles;
}

async function obfuscateDirectory(targetDir) {
    if (!fs.existsSync(targetDir)) {
        console.error(`Target directory does not exist: ${targetDir}`);
        process.exit(1);
    }

    const jsFiles = getAllJsFiles(targetDir);

    console.log(`Found ${jsFiles.length} JavaScript files to obfuscate.`);

    const obfuscationOptions = {
        target: 'node',
        preset: 'medium',

        compact: true,
        minify: true,

        identifierGenerator: 'randomized',
        renameVariables: true,
        renameGlobals: false,

        stringConcealing: true,
        stringCompression: true,

        hexadecimalNumbers: true,
        duplicateLiteralsRemoval: true,

        calculator: true,

        controlFlowFlattening: false,
        opaquePredicates: false,
        deadCode: false,

        dispatcher: false,
        rgf: false,

        movedDeclarations: false,
        globalConcealing: false,

        lock: {
            selfDefending: false,
            antiDebug: false
        }
    };

    let obfuscatedCount = 0;

    for (const filePath of jsFiles) {
        try {
            const code = fs.readFileSync(filePath, 'utf8');

            const result = await JsConfuser.obfuscate(
                code,
                obfuscationOptions
            );

            fs.writeFileSync(filePath, result, 'utf8');

            console.log(
                `Obfuscated: ${path.relative(targetDir, filePath)}`
            );

            obfuscatedCount++;
        } catch (err) {
            console.error(
                `Error obfuscating ${filePath}:`,
                err.message
            );

            process.exit(1);
        }
    }

    console.log(
        `Successfully obfuscated ${obfuscatedCount}/${jsFiles.length} files.`
    );
}

const targetDir = process.argv[2];

if (!targetDir) {
    console.error(
        'Please specify target directory. Usage: node obfuscate.js <target_dir>'
    );
    process.exit(1);
}

obfuscateDirectory(path.resolve(targetDir));
