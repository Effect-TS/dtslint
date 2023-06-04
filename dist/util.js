"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMainFile = exports.mapDefinedAsync = exports.assertDefined = exports.last = exports.withoutPrefix = exports.getCompilerOptions = exports.getCommonDirectoryName = exports.failure = exports.readJson = exports.createRule = void 0;
const utils_1 = require("@typescript-eslint/utils");
const assert = require("assert");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const stripJsonComments = require("strip-json-comments");
exports.createRule = utils_1.ESLintUtils.RuleCreator((name) => `https://github.com/microsoft/DefinitelyTyped-tools/tree/master/packages/dtslint/src/rules/${name}.ts`);
async function readJson(path) {
    const text = await (0, fs_extra_1.readFile)(path, "utf-8");
    return JSON.parse(stripJsonComments(text));
}
exports.readJson = readJson;
function failure(ruleName, s) {
    return `${s} See: https://github.com/microsoft/DefinitelyTyped-tools/blob/master/packages/dtslint/docs/${ruleName}.md`;
}
exports.failure = failure;
function getCommonDirectoryName(files) {
    let minLen = 999;
    let minDir = "";
    for (const file of files) {
        const dir = (0, path_1.dirname)(file);
        if (dir.length < minLen) {
            minDir = dir;
            minLen = dir.length;
        }
    }
    return (0, path_1.basename)(minDir);
}
exports.getCommonDirectoryName = getCommonDirectoryName;
async function getCompilerOptions(dirPath) {
    const tsconfigPath = (0, path_1.join)(dirPath, "tsconfig.json");
    if (!(await (0, fs_extra_1.pathExists)(tsconfigPath))) {
        throw new Error(`Need a 'tsconfig.json' file in ${dirPath}`);
    }
    return (await readJson(tsconfigPath)).compilerOptions;
}
exports.getCompilerOptions = getCompilerOptions;
function withoutPrefix(s, prefix) {
    return s.startsWith(prefix) ? s.slice(prefix.length) : undefined;
}
exports.withoutPrefix = withoutPrefix;
function last(a) {
    assert(a.length !== 0);
    return a[a.length - 1];
}
exports.last = last;
function assertDefined(a) {
    if (a === undefined) {
        throw new Error();
    }
    return a;
}
exports.assertDefined = assertDefined;
async function mapDefinedAsync(arr, mapper) {
    const out = [];
    for (const a of arr) {
        const res = await mapper(a);
        if (res !== undefined) {
            out.push(res);
        }
    }
    return out;
}
exports.mapDefinedAsync = mapDefinedAsync;
function isMainFile(fileName, allowNested) {
    // Linter may be run with cwd of the package. We want `index.d.ts` but not `submodule/index.d.ts` to match.
    if (fileName === "index.d.ts") {
        return true;
    }
    if ((0, path_1.basename)(fileName) !== "index.d.ts") {
        return false;
    }
    let parent = (0, path_1.dirname)(fileName);
    // May be a directory for an older version, e.g. `v0`.
    // Note a types redirect `foo/ts3.1` should not have its own header.
    if (allowNested && /^v(0\.)?\d+$/.test((0, path_1.basename)(parent))) {
        parent = (0, path_1.dirname)(parent);
    }
    // Allow "types/foo/index.d.ts", not "types/foo/utils/index.d.ts"
    return (0, path_1.basename)((0, path_1.dirname)(parent)) === "types";
}
exports.isMainFile = isMainFile;
