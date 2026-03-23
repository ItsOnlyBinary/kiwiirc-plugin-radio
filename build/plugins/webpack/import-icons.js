/* eslint-disable no-cond-assign */

const fs = require('fs');
const path = require('path');

const sourceDir = path.resolve('src/');
const outputFile = path.resolve('src/libs/iconLibrary.js');

const fileRegex = /\.(vue|js)$/;

module.exports = class ImportIconsPlugin {
    apply(compiler) {
        const pluginName = this.constructor.name;
        let warnings = [];
        let scannedFiles = [];

        compiler.hooks.beforeRun.tapAsync(pluginName, (compilation, callback) => {
            // run in build mode
            warnings = [];
            scannedFiles = [];
            parseIcons(warnings, scannedFiles, callback);
        });

        compiler.hooks.watchRun.tapAsync(pluginName, (compilation, callback) => {
            // run in dev mode
            warnings = [];
            scannedFiles = [];
            parseIcons(warnings, scannedFiles, callback);
        });

        compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
            compilation.warnings.push(...warnings);
        });

        // Register all scanned source files as watched dependencies so that webpack
        // picks up changes even after a warning-only compilation (where the module
        // graph walk may not have reached every file the plugin scanned).
        compiler.hooks.afterCompile.tap(pluginName, (compilation) => {
            scannedFiles.forEach((file) => compilation.fileDependencies.add(file));
        });
    }
};

const types = {
    'fa': 'solid',
    'fas': 'solid',
    'fa-solid': 'solid',
    'far': 'regular',
    'fa-regular': 'regular',
};

const typesReverse = {
    solid: 'fas',
    regular: 'far',
};

function parseIcons(warnings, scannedFiles, callback) {
    const files = getFiles(sourceDir);
    scannedFiles.push(...files);

    // Maps icon string → first source file that references it (for error messages)
    const allIcons = Object.create(null);

    files.forEach((filePath) => {
        const data = fs.readFileSync(filePath, 'utf8');

        let result;

        // Match icon="fa-solid fa-users" (static string binding)
        const htmlStringRegex = /<(?:SvgIcon|svg-icon).*?\sicon=["']([^"']+)["']/gsi;
        while ((result = htmlStringRegex.exec(data)) !== null) {
            const icon = (result[1] || '').trim();
            if (icon) {
                allIcons[icon] = allIcons[icon] || filePath;
            }
        }

        // Match :icon="['fa-solid', 'fa-users']" (static array binding with string literals)
        const htmlArrayRegex = /\s:icon=["']\[["']([^"']+)["'],\s*["']([^"']+)["']\]["']/gsi;
        while ((result = htmlArrayRegex.exec(data)) !== null) {
            const icon = `${(result[1] || '').trim()} ${(result[2] || '').trim()}`;
            if (icon.trim()) {
                allIcons[icon] = allIcons[icon] || filePath;
            }
        }

        // Match comment hints for dynamic icons: // svg-icons: fas-caret-down, fas-caret-up
        const commentRegex = /(?:\/\/|<!--|\/*)\s*svg[\s-]icons?: (.+?)\s*(?:;|-->|\*\/|$)/gmi;
        while ((result = commentRegex.exec(data)) !== null) {
            const icons = (result[1] || '').split(/,\s*/);
            icons.forEach((_icon) => {
                const icon = _icon.trim();
                if (icon) {
                    allIcons[icon] = allIcons[icon] || filePath;
                }
            });
        }
    });

    const allTypes = Object.create(null);
    Object.keys(allIcons).forEach((icon) => {
        const sourceFile = path.relative(sourceDir, allIcons[icon]);
        const iconParts = icon.split(/\s+/);
        let iconObj;
        iconParts.forEach((iconPart) => {
            if (Object.prototype.hasOwnProperty.call(types, iconPart)) {
                iconObj = {
                    type: types[iconPart],
                };
                return;
            }

            const strParts = iconPart.split('-');
            const iconType = strParts.shift();
            if (!iconObj?.type && Object.prototype.hasOwnProperty.call(types, iconType)) {
                iconObj = {
                    type: types[iconType],
                };
            }

            if (!iconObj) {
                warnings.push(new Error(`Warning: failed to parse icon "${iconParts.join(' ')}" (in ${sourceFile})`));
                return;
            }

            const iconName = titleCase(strParts.join('-'));
            if (!iconName) {
                warnings.push(new Error(`Warning: could not determine icon name from "${icon}" (in ${sourceFile})`));
                return;
            }

            const iconFile = path.resolve(`node_modules/@fortawesome/free-${iconObj.type}-svg-icons/fa${iconName}.js`);
            if (!fs.existsSync(iconFile)) {
                warnings.push(new Error(`Warning: icon "@fortawesome/free-${iconObj.type}-svg-icons/fa${iconName}" does not exist (used in ${sourceFile})`));
                return;
            }

            iconObj.icon = iconName;
        });

        if (iconObj && iconObj.icon) {
            if (!allTypes[iconObj.type]) {
                allTypes[iconObj.type] = {};
            }
            allTypes[iconObj.type][iconObj.icon] = true;
        }
    });

    writeFile(allTypes);

    callback();
}

function writeFile(allTypes) {
    let outContent = '/*\n    --== DO NOT EDIT ==--\n\n    This file is auto generated\n*/\n\n';

    Object.keys(allTypes).forEach((type) => {
        Object.keys(allTypes[type]).sort().forEach((iconName) => {
            outContent += `import { fa${iconName} as ${typesReverse[type]}${iconName} } from '@fortawesome/free-${type}-svg-icons/fa${iconName}';\n`;
        });
        outContent += '\n';
    });

    outContent += '/* global kiwi:true */\n';
    outContent += 'kiwi.svgIcons.library.add(\n';

    Object.keys(allTypes).forEach((type) => {
        Object.keys(allTypes[type]).sort().forEach((iconName) => {
            outContent += `    ${typesReverse[type]}${iconName},\n`;
        });
    });

    outContent += ');\n';

    writeIfChanged(outputFile, outContent);
}

function writeIfChanged(file, _data) {
    const data = Buffer.from(_data);
    if (fs.existsSync(file) && data.equals(fs.readFileSync(file))) {
        return;
    }

    fs.writeFileSync(file, data);
}

function getFiles(sourceDir) {
    const files = [];

    const readDir = (dirPath) => fs.readdirSync(dirPath).forEach((name) => {
        const entry = path.join(dirPath, name);
        fs.lstatSync(entry).isDirectory() ? readDir(entry) : files.push(entry);
    });

    readDir(sourceDir);

    return files.filter(
        (file) => (fileRegex.test(file) && file !== outputFile)
    );
}

function titleCase(str) {
    return str.replace(/(?:\b|-)(\w)/g, (match, p1) => p1.toUpperCase());
}
