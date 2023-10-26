#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.installTypeScriptNext = void 0;
const child_process_1 = require("child_process");
const fs = __importStar(require("fs-extra"));
const NodePath = __importStar(require("node:path"));
const os = __importStar(require("os"));
const tslint_1 = require("tslint");
var TypeScriptVersion;
(function (TypeScriptVersion) {
    /** Add to this list when a version actually ships.  */
    TypeScriptVersion.shipped = [
        "5.0",
        "5.1",
        "5.2"
    ];
    /** Add to this list when a version is available as typescript@next */
    TypeScriptVersion.supported = [...TypeScriptVersion.shipped, "5.3"];
    TypeScriptVersion.latest = TypeScriptVersion.supported[TypeScriptVersion.supported.length - 1];
})(TypeScriptVersion || (TypeScriptVersion = {}));
const installsDir = NodePath.join(os.homedir(), ".dts", "typescript-installs");
main().catch((err) => {
    console.error(err.stack);
    process.exit(1);
});
async function main() {
    const args = process.argv.slice(2);
    let dirPath = process.cwd();
    for (const arg of args) {
        switch (arg) {
            case "--installAll":
                console.log("Cleaning old installs and installing for all TypeScript versions...");
                await cleanTypeScriptInstalls();
                await installAllTypeScriptVersions();
                return;
            default: {
                if (arg.startsWith("--")) {
                    console.error(`Unknown option '${arg}'`);
                    process.exit(1);
                }
                const path = arg;
                dirPath = NodePath.join(dirPath, path);
            }
        }
    }
    await installAllTypeScriptVersions();
    const err = lint(dirPath, TypeScriptVersion.supported);
    if (err) {
        throw new Error(err);
    }
}
function lint(dirPath, versions) {
    const tsconfigPath = NodePath.join(dirPath, "tsconfig.json");
    const lintProgram = tslint_1.Linter.createProgram(tsconfigPath);
    const linter = new tslint_1.Linter({ fix: false, formatter: "stylish" }, lintProgram);
    const config = getLintConfig(tsconfigPath, versions);
    for (const file of lintProgram.getSourceFiles()) {
        // External dependencies should have been handled by `testDependencies`;
        if (!isExternalDependency(file, dirPath, lintProgram)) {
            const { fileName, text } = file;
            console.log(`[INFO] linting ${NodePath.basename(fileName)}...`);
            linter.lint(fileName, text, config);
        }
    }
    const result = linter.getResult();
    const output = result.failures.length ? result.output : "";
    return output;
}
function isExternalDependency(file, dirPath, program) {
    return !startsWithDirectory(file.fileName, dirPath) ||
        program.isSourceFileFromExternalLibrary(file);
}
function startsWithDirectory(filePath, dirPath) {
    const normalFilePath = normalizePath(filePath);
    const normalDirPath = normalizePath(dirPath).replace(/\/$/, "");
    return normalFilePath.startsWith(normalDirPath + "/") ||
        normalFilePath.startsWith(normalDirPath + "\\");
}
function normalizePath(file) {
    // replaces '\' with '/' and forces all DOS drive letters to be upper-case
    return NodePath.normalize(file)
        .replace(/\\/g, "/")
        .replace(/^[a-z](?=:)/, (c) => c.toUpperCase());
}
function getLintConfig(tsconfigPath, versions) {
    const configPath = NodePath.join(__dirname, "dtslint.json");
    // Second param to `findConfiguration` doesn't matter, since config path is provided.
    const config = tslint_1.Configuration.findConfiguration(configPath, "").results;
    if (!config) {
        throw new Error(`Could not load config at ${configPath}`);
    }
    const expectRule = config.rules.get("expect");
    if (!expectRule) {
        throw new Error("'expect' rule should be enabled, else compile errors are ignored");
    }
    const versionsToTest = versions.map((versionName) => ({
        versionName,
        path: typeScriptPath(versionName)
    }));
    const expectOptions = { tsconfigPath, versionsToTest };
    expectRule.ruleArguments = [expectOptions];
    return config;
}
function typeScriptPath(version) {
    return NodePath.join(installDir(version), "node_modules", "typescript");
}
function installDir(version) {
    if (version === "next")
        version = TypeScriptVersion.latest;
    if (version === "rc") {
        version = TypeScriptVersion.supported[TypeScriptVersion.supported.length - 2];
    }
    return NodePath.join(installsDir, version);
}
function cleanTypeScriptInstalls() {
    return fs.remove(installsDir);
}
async function install(version) {
    const dir = installDir(version);
    if (!(await fs.pathExists(dir))) {
        console.log(`Installing to ${dir}...`);
        await fs.mkdirp(dir);
        await fs.writeJson(NodePath.join(dir, "package.json"), {
            description: `Installs typescript@${version}`,
            repository: "N/A",
            license: "MIT",
            dependencies: {
                typescript: version
            }
        });
        await execAndThrowErrors("npm install --ignore-scripts --no-shrinkwrap --no-package-lock --no-bin-links", dir);
        console.log("Installed!");
    }
}
/** Run a command and return the stdout, or if there was an error, throw. */
async function execAndThrowErrors(cmd, cwd) {
    // tslint:disable-next-line:promise-must-complete
    return new Promise((resolve, reject) => {
        const env = { ...process.env };
        if (env.NODE_OPTIONS && env.NODE_OPTIONS.includes("--require")) {
            delete env.NODE_OPTIONS;
        }
        (0, child_process_1.exec)(cmd, { encoding: "utf8", cwd, env }, (err, _stdout, stderr) => {
            if (stderr) {
                console.error(stderr);
            }
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}
async function installAllTypeScriptVersions() {
    for (const v of TypeScriptVersion.shipped) {
        await install(v);
    }
    // `shipped + [rc, next] == supported` during the RC period. During that time, typescript@rc needs to be installed too.
    if (TypeScriptVersion.shipped.length + 2 === TypeScriptVersion.supported.length) {
        await install("rc");
    }
    await installTypeScriptNext();
}
async function installTypeScriptNext() {
    await install("next");
}
exports.installTypeScriptNext = installTypeScriptNext;
