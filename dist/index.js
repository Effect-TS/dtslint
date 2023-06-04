#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// package.json
var require_package = __commonJS({
  "package.json"(exports, module2) {
    module2.exports = {
      name: "@effect/dtslint",
      version: "0.0.0",
      publishConfig: {
        access: "public",
        directory: "dist"
      },
      description: "Effect's custom fork of dtslint used to lint TypeScript declaration (.d.ts) files",
      engines: {
        node: ">=16.17.1"
      },
      scripts: {
        version: "changeset version && pnpm install --no-frozen-lockfile && pnpm run docs-update",
        release: "pnpm run build && changeset publish",
        test: "echo 'No tests to run'",
        build: "tsup && tsc -p tsconfig.rules.json && pnpm copy-package-json",
        "copy-package-json": "ts-node scripts/copy-package-json.ts",
        docs: "echo 'No docs'",
        "docs-update": "git add --force --all docs/modules || true"
      },
      repository: {
        type: "git",
        url: "https://github.com/effect-ts/dtslint.git"
      },
      author: "Giulio Canti <giulio.canti@gmail.com>",
      license: "MIT",
      bugs: {
        url: "https://github.com/effect-ts/dtslint/issues"
      },
      homepage: "https://github.com/effect-ts/dtslint",
      dependencies: {
        "@definitelytyped/dts-critic": "^0.0.163",
        "@definitelytyped/header-parser": "^0.0.163",
        "@definitelytyped/typescript-versions": "^0.0.163",
        "@definitelytyped/utils": "^0.0.163",
        "@typescript-eslint/eslint-plugin": "^5.55.0",
        "@typescript-eslint/parser": "^5.55.0",
        "@typescript-eslint/types": "^5.56.0",
        "@typescript-eslint/typescript-estree": "^5.55.0",
        "@typescript-eslint/utils": "^5.55.0",
        eslint: "^8.17.0",
        "fs-extra": "^6.0.1",
        "json-stable-stringify": "^1.0.1",
        "strip-json-comments": "^2.0.1",
        tslint: "5.14.0",
        yargs: "^15.1.0"
      },
      devDependencies: {
        "@changesets/changelog-github": "^0.4.8",
        "@changesets/cli": "^2.26.1",
        "@effect/data": "^0.12.5",
        "@effect/io": "^0.26.0",
        "@types/eslint": "^8.4.2",
        "@types/fs-extra": "^5.0.2",
        "@types/json-stable-stringify": "^1.0.32",
        "@types/strip-json-comments": "^0.0.28",
        "@vitest/coverage-c8": "^0.31.0",
        tsup: "^6.7.0",
        typescript: "^5.0.4"
      },
      peerDependencies: {
        typescript: "^5.x"
      },
      tags: [],
      keywords: []
    };
  }
});

// src/index.ts
var src_exports = {};
__export(src_exports, {
  assertPackageIsNotDeprecated: () => assertPackageIsNotDeprecated
});
module.exports = __toCommonJS(src_exports);
var import_header_parser2 = require("@definitelytyped/header-parser");
var import_typescript_versions3 = require("@definitelytyped/typescript-versions");
var import_fs_extra4 = require("fs-extra");
var import_path5 = require("path");

// src/install.ts
var import_child_process = require("child_process");
var fs = __toESM(require("fs-extra"));
var os = __toESM(require("os"));
var path = __toESM(require("path"));
var process2 = __toESM(require("process"));
var import_typescript_versions = require("@definitelytyped/typescript-versions");
var assert = require("assert");
var installsDir = path.join(os.homedir(), ".dts", "typescript-installs");
async function installAllTypeScriptVersions() {
  const i = import_typescript_versions.TypeScriptVersion.shipped.indexOf("5.0");
  const installs = i !== -1 ? import_typescript_versions.TypeScriptVersion.shipped.slice(i) : import_typescript_versions.TypeScriptVersion.shipped;
  console.log("installing", installs, "...");
  for (const v of installs) {
    await install(v);
  }
}
async function installTypeScriptNext() {
  await install("next");
}
function cleanTypeScriptInstalls() {
  return fs.remove(installsDir);
}
async function install(version2) {
  if (version2 === "local") {
    return;
  }
  const dir = installDir(version2);
  if (!await fs.pathExists(dir)) {
    console.log(`Installing to ${dir}...`);
    await fs.mkdirp(dir);
    await fs.writeJson(path.join(dir, "package.json"), {
      description: `Installs typescript@${version2}`,
      repository: "N/A",
      license: "MIT",
      dependencies: {
        typescript: version2
      }
    });
    await execAndThrowErrors("npm install --ignore-scripts --no-shrinkwrap --no-package-lock --no-bin-links", dir);
    console.log("Installed!");
    console.log("");
  }
}
function installDir(version2) {
  assert(version2 !== "local");
  if (version2 === "next")
    version2 = import_typescript_versions.TypeScriptVersion.latest;
  if (version2 === "rc")
    version2 = import_typescript_versions.TypeScriptVersion.supported[import_typescript_versions.TypeScriptVersion.supported.length - 2];
  return path.join(installsDir, version2);
}
async function execAndThrowErrors(cmd, cwd) {
  return new Promise((resolve2, reject) => {
    const env2 = { ...process2.env };
    if (env2.NODE_OPTIONS && env2.NODE_OPTIONS.includes("--require")) {
      delete env2.NODE_OPTIONS;
    }
    (0, import_child_process.exec)(cmd, { encoding: "utf8", cwd, env: env2 }, (err, _stdout, stderr) => {
      if (stderr) {
        console.error(stderr);
      }
      if (err) {
        reject(err);
      } else {
        resolve2();
      }
    });
  });
}

// src/checks.ts
var import_header_parser = require("@definitelytyped/header-parser");
var import_fs_extra2 = require("fs-extra");
var import_path2 = require("path");

// src/util.ts
var import_utils = require("@typescript-eslint/utils");
var import_fs_extra = require("fs-extra");
var import_path = require("path");
var assert2 = require("assert");
var stripJsonComments = require("strip-json-comments");
var createRule = import_utils.ESLintUtils.RuleCreator(
  (name) => `https://github.com/microsoft/DefinitelyTyped-tools/tree/master/packages/dtslint/src/rules/${name}.ts`
);
async function readJson(path2) {
  const text = await (0, import_fs_extra.readFile)(path2, "utf-8");
  return JSON.parse(stripJsonComments(text));
}
async function getCompilerOptions(dirPath) {
  const tsconfigPath = (0, import_path.join)(dirPath, "tsconfig.json");
  if (!await (0, import_fs_extra.pathExists)(tsconfigPath)) {
    throw new Error(`Need a 'tsconfig.json' file in ${dirPath}`);
  }
  return (await readJson(tsconfigPath)).compilerOptions;
}
function withoutPrefix(s, prefix) {
  return s.startsWith(prefix) ? s.slice(prefix.length) : void 0;
}
function last(a) {
  assert2(a.length !== 0);
  return a[a.length - 1];
}
async function mapDefinedAsync(arr, mapper) {
  const out = [];
  for (const a of arr) {
    const res = await mapper(a);
    if (res !== void 0) {
      out.push(res);
    }
  }
  return out;
}

// src/checks.ts
var assert3 = require("assert");
async function checkPackageJson(dirPath, typesVersions) {
  const pkgJsonPath = (0, import_path2.join)(dirPath, "package.json");
  const needsTypesVersions = typesVersions.length !== 0;
  if (!await (0, import_fs_extra2.pathExists)(pkgJsonPath)) {
    if (needsTypesVersions) {
      throw new Error(`${dirPath}: Must have 'package.json' for "typesVersions"`);
    }
    return;
  }
  const pkgJson = await readJson(pkgJsonPath);
  if (pkgJson.private !== true) {
    throw new Error(`${pkgJsonPath} should set \`"private": true\``);
  }
  if (needsTypesVersions) {
    assert3.strictEqual(pkgJson.types, "index", `"types" in '${pkgJsonPath}' should be "index".`);
    const expected = (0, import_header_parser.makeTypesVersionsForPackageJson)(typesVersions);
    assert3.deepEqual(
      pkgJson.typesVersions,
      expected,
      `"typesVersions" in '${pkgJsonPath}' is not set right. Should be: ${JSON.stringify(expected, void 0, 4)}`
    );
  }
  for (const key in pkgJson) {
    switch (key) {
      case "private":
      case "dependencies":
      case "license":
      case "imports":
      case "exports":
      case "type":
        break;
      case "typesVersions":
      case "types":
        if (!needsTypesVersions) {
          throw new Error(`${pkgJsonPath} doesn't need to set "${key}" when no 'ts3.x' directories exist.`);
        }
        break;
      default:
        throw new Error(`${pkgJsonPath} should not include field ${key}`);
    }
  }
}
function checkTsconfig(options, dt) {
  if (dt) {
    const { relativeBaseUrl } = dt;
    const mustHave = {
      noEmit: true,
      forceConsistentCasingInFileNames: true,
      baseUrl: relativeBaseUrl,
      typeRoots: [relativeBaseUrl],
      types: []
    };
    for (const key of Object.getOwnPropertyNames(mustHave)) {
      const expected = mustHave[key];
      const actual = options[key];
      if (!deepEquals(expected, actual)) {
        throw new Error(
          `Expected compilerOptions[${JSON.stringify(key)}] === ${JSON.stringify(expected)}, but got ${JSON.stringify(
            actual
          )}`
        );
      }
    }
    for (const key in options) {
      switch (key) {
        case "lib":
        case "noImplicitAny":
        case "noImplicitThis":
        case "strict":
        case "strictNullChecks":
        case "noUncheckedIndexedAccess":
        case "strictFunctionTypes":
        case "esModuleInterop":
        case "allowSyntheticDefaultImports":
        case "paths":
        case "target":
        case "jsx":
        case "jsxFactory":
        case "experimentalDecorators":
        case "noUnusedLocals":
        case "noUnusedParameters":
        case "exactOptionalPropertyTypes":
        case "module":
          break;
        default:
          if (!(key in mustHave)) {
            throw new Error(`Unexpected compiler option ${key}`);
          }
      }
    }
  }
  if (!("lib" in options)) {
    throw new Error('Must specify "lib", usually to `"lib": ["es6"]` or `"lib": ["es6", "dom"]`.');
  }
  if (!("module" in options)) {
    throw new Error('Must specify "module" to `"module": "commonjs"` or `"module": "node16"`.');
  }
  if (options.module?.toString().toLowerCase() !== "commonjs" && options.module?.toString().toLowerCase() !== "node16") {
    throw new Error(`When "module" is present, it must be set to "commonjs" or "node16".`);
  }
  if ("strict" in options) {
    if (options.strict !== true) {
      throw new Error('When "strict" is present, it must be set to `true`.');
    }
    for (const key of ["noImplicitAny", "noImplicitThis", "strictNullChecks", "strictFunctionTypes"]) {
      if (key in options) {
        throw new TypeError(`Expected "${key}" to not be set when "strict" is \`true\`.`);
      }
    }
  } else {
    for (const key of ["noImplicitAny", "noImplicitThis", "strictNullChecks", "strictFunctionTypes"]) {
      if (!(key in options)) {
        throw new Error(`Expected \`"${key}": true\` or \`"${key}": false\`.`);
      }
    }
  }
  if ("exactOptionalPropertyTypes" in options) {
    if (options.exactOptionalPropertyTypes !== true) {
      throw new Error('When "exactOptionalPropertyTypes" is present, it must be set to `true`.');
    }
  }
  if (options.types && options.types.length) {
    throw new Error(
      'Use `/// <reference types="..." />` directives in source files and ensure that the "types" field in your tsconfig is an empty array.'
    );
  }
}
function deepEquals(expected, actual) {
  if (expected instanceof Array) {
    return actual instanceof Array && actual.length === expected.length && expected.every((e, i) => deepEquals(e, actual[i]));
  } else {
    return expected === actual;
  }
}

// src/lint.ts
var import_typescript_versions2 = require("@definitelytyped/typescript-versions");
var import_utils2 = require("@definitelytyped/utils");
var import_fs_extra3 = require("fs-extra");
var import_path4 = require("path");
var import_tslint = require("tslint");
var import_eslint = require("eslint");

// src/rules/expectRule.ts
var import_fs = require("fs");
var import_path3 = require("path");
var Lint = __toESM(require("tslint"));
var TsType = __toESM(require("typescript"));
var os2 = require("os");
var cacheDir = (0, import_path3.join)(os2.homedir(), ".dts");
var perfDir = (0, import_path3.join)(os2.homedir(), ".dts", "perf");
var Rule = class extends Lint.Rules.TypedRule {
  // TODO: If this naming convention is required by tslint, dump it when switching to eslint
  // eslint-disable-next-line @typescript-eslint/naming-convention
  static FAILURE_STRING(expectedVersion, expectedType, actualType) {
    return `TypeScript@${expectedVersion} expected type to be:
  ${expectedType}
got:
  ${actualType}`;
  }
  applyWithProgram(sourceFile, lintProgram) {
    const options = this.ruleArguments[0];
    if (!options) {
      return this.applyWithFunction(
        sourceFile,
        (ctx) => walk(
          ctx,
          lintProgram,
          TsType,
          "next",
          /*nextHigherVersion*/
          void 0
        )
      );
    }
    const { tsconfigPath, versionsToTest } = options;
    const getFailures = ({ versionName, path: path2 }, nextHigherVersion, writeOutput) => {
      const ts = require(path2);
      ts.performance.enable();
      const program = getProgram(tsconfigPath, ts, versionName, lintProgram);
      const failures = this.applyWithFunction(
        sourceFile,
        (ctx) => walk(ctx, program, ts, versionName, nextHigherVersion)
      );
      if (writeOutput) {
        const packageName = (0, import_path3.basename)((0, import_path3.dirname)(tsconfigPath));
        if (!packageName.match(/v\d+/) && !packageName.match(/ts\d\.\d/)) {
          const d = {
            [packageName]: extendedDiagnostics(ts, program)
          };
          if (!(0, import_fs.existsSync)(cacheDir)) {
            (0, import_fs.mkdirSync)(cacheDir);
          }
          if (!(0, import_fs.existsSync)(perfDir)) {
            (0, import_fs.mkdirSync)(perfDir);
          }
          (0, import_fs.writeFileSync)((0, import_path3.join)(perfDir, `${packageName}.json`), JSON.stringify(d));
        }
      }
      return failures;
    };
    const maxFailures = getFailures(
      last(versionsToTest),
      void 0,
      /*writeOutput*/
      true
    );
    if (maxFailures.length) {
      return maxFailures;
    }
    const minFailures = getFailures(
      versionsToTest[0],
      void 0,
      /*writeOutput*/
      false
    );
    if (!minFailures.length) {
      return [];
    }
    for (let i = versionsToTest.length - 2; i >= 0; i--) {
      const failures = getFailures(
        versionsToTest[i],
        options.versionsToTest[i + 1].versionName,
        /*writeOutput*/
        false
      );
      if (failures.length) {
        return failures;
      }
    }
    throw new Error();
  }
};
Rule.metadata = {
  ruleName: "expect",
  description: "Asserts types with $ExpectType.",
  optionsDescription: "Not configurable.",
  options: null,
  type: "functionality",
  typescriptOnly: true,
  requiresTypeInfo: true
};
Rule.FAILURE_STRING_DUPLICATE_ASSERTION = "This line has 2 $ExpectType assertions.";
Rule.FAILURE_STRING_ASSERTION_MISSING_NODE = "Can not match a node to this assertion. If this is a multiline function call, ensure the assertion is on the line above.";
function extendedDiagnostics(ts, program) {
  const caches = program.getRelationCacheSizes();
  const perf = {
    files: program.getSourceFiles().length,
    ...countLines(ts, program),
    identifiers: program.getIdentifierCount(),
    symbols: program.getSymbolCount(),
    types: program.getTypeCount(),
    instantiations: program.getInstantiationCount(),
    memory: ts.sys.getMemoryUsage ? ts.sys.getMemoryUsage() : 0,
    "assignability cache size": caches.assignable,
    "identity cache size": caches.identity,
    "subtype cache size": caches.subtype,
    "strict subtype cache size": caches.strictSubtype
  };
  ts.performance.forEachMeasure((name, duration) => {
    perf[name] = duration;
  });
  perf["total time"] = perf.Program + perf.Bind + perf.Check;
  return perf;
}
function countLines(ts, program) {
  const counts = {
    library: 0,
    definitions: 0,
    typescript: 0,
    javascript: 0,
    json: 0,
    other: 0
  };
  for (const file of program.getSourceFiles()) {
    counts[getCountKey(ts, program, file)] += ts.getLineStarts(file).length;
  }
  return counts;
}
function getCountKey(ts, program, file) {
  if (program.isSourceFileDefaultLibrary(file)) {
    return "library";
  } else if (file.isDeclarationFile) {
    return "definitions";
  }
  const path2 = file.path;
  if (ts.fileExtensionIsOneOf(path2, ts.supportedTSExtensionsFlat)) {
    return "typescript";
  } else if (ts.fileExtensionIsOneOf(path2, ts.supportedJSExtensionsFlat)) {
    return "javascript";
  } else if (ts.fileExtensionIs(path2, ts.Extension.Json)) {
    return "json";
  } else {
    return "other";
  }
}
var programCache = /* @__PURE__ */ new WeakMap();
function getProgram(configFile, ts, versionName, lintProgram) {
  let versionToProgram = programCache.get(lintProgram);
  if (versionToProgram === void 0) {
    versionToProgram = /* @__PURE__ */ new Map();
    programCache.set(lintProgram, versionToProgram);
  }
  let newProgram = versionToProgram.get(versionName);
  if (newProgram === void 0) {
    newProgram = createProgram(configFile, ts);
    versionToProgram.set(versionName, newProgram);
  }
  return newProgram;
}
function createProgram(configFile, ts) {
  const projectDirectory = (0, import_path3.dirname)(configFile);
  const { config } = ts.readConfigFile(configFile, ts.sys.readFile);
  const parseConfigHost = {
    fileExists: import_fs.existsSync,
    readDirectory: ts.sys.readDirectory,
    readFile: (file) => (0, import_fs.readFileSync)(file, "utf8"),
    useCaseSensitiveFileNames: true
  };
  const parsed = ts.parseJsonConfigFileContent(config, parseConfigHost, (0, import_path3.resolve)(projectDirectory), {
    noEmit: true
  });
  const host = ts.createCompilerHost(parsed.options, true);
  return ts.createProgram(parsed.fileNames, parsed.options, host);
}
function walk(ctx, program, ts, versionName, nextHigherVersion) {
  const { fileName } = ctx.sourceFile;
  const sourceFile = program.getSourceFile(fileName);
  if (!sourceFile) {
    ctx.addFailure(
      0,
      0,
      `Program source files differ between TypeScript versions. This may be a dtslint bug.
Expected to find a file '${fileName}' present in ${TsType.version}, but did not find it in ts@${versionName}.`
    );
    return;
  }
  const checker = program.getTypeChecker();
  const diagnostics = ts.getPreEmitDiagnostics(program, sourceFile);
  for (const diagnostic of diagnostics) {
    addDiagnosticFailure(diagnostic);
  }
  if (sourceFile.isDeclarationFile || !sourceFile.text.includes("$ExpectType")) {
    return;
  }
  const { typeAssertions, duplicates } = parseAssertions(sourceFile);
  for (const line of duplicates) {
    addFailureAtLine(line, Rule.FAILURE_STRING_DUPLICATE_ASSERTION);
  }
  const { unmetExpectations, unusedAssertions } = getExpectTypeFailures(sourceFile, typeAssertions, checker, ts);
  for (const { node, expected, actual } of unmetExpectations) {
    ctx.addFailureAtNode(node, Rule.FAILURE_STRING(versionName, expected, actual));
  }
  for (const line of unusedAssertions) {
    addFailureAtLine(line, Rule.FAILURE_STRING_ASSERTION_MISSING_NODE);
  }
  function addDiagnosticFailure(diagnostic) {
    const intro = getIntro();
    if (diagnostic.file === sourceFile) {
      const msg = `${intro}
${ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")}`;
      ctx.addFailureAt(diagnostic.start, diagnostic.length, msg);
    } else {
      ctx.addFailureAt(0, 0, `${intro}
${fileName}${diagnostic.messageText}`);
    }
  }
  function getIntro() {
    if (nextHigherVersion === void 0) {
      return `TypeScript@${versionName} compile error: `;
    } else {
      const msg = `Compile error in typescript@${versionName} but not in typescript@${nextHigherVersion}.
`;
      const explain = nextHigherVersion === "next" ? "TypeScript@next features not yet supported." : `Fix with a comment '// Minimum TypeScript Version: ${nextHigherVersion}' just under the header.`;
      return msg + explain;
    }
  }
  function addFailureAtLine(line, failure) {
    const start = sourceFile.getPositionOfLineAndCharacter(line, 0);
    let end = start + sourceFile.text.split("\n")[line].length;
    if (sourceFile.text[end - 1] === "\r") {
      end--;
    }
    ctx.addFailure(start, end, `TypeScript@${versionName}: ${failure}`);
  }
}
function parseAssertions(sourceFile) {
  const typeAssertions = /* @__PURE__ */ new Map();
  const duplicates = [];
  const { text } = sourceFile;
  const commentRegexp = /\/\/(.*)/g;
  const lineStarts = sourceFile.getLineStarts();
  let curLine = 0;
  while (true) {
    const commentMatch = commentRegexp.exec(text);
    if (commentMatch === null) {
      break;
    }
    if (!commentMatch[1].startsWith(" $ExpectType ")) {
      continue;
    }
    const line = getLine(commentMatch.index);
    const expectedType = commentMatch[1].slice(" $ExpectType ".length);
    if (typeAssertions.delete(line)) {
      duplicates.push(line);
    } else {
      typeAssertions.set(line, expectedType);
    }
  }
  return { typeAssertions, duplicates };
  function getLine(pos) {
    while (lineStarts[curLine + 1] <= pos) {
      curLine++;
    }
    return isFirstOnLine(text, lineStarts[curLine], pos) ? curLine + 1 : curLine;
  }
}
function isFirstOnLine(text, lineStart, pos) {
  for (let i = lineStart; i < pos; i++) {
    if (text[i] !== " ") {
      return false;
    }
  }
  return true;
}
function matchReadonlyArray(actual, expected) {
  if (!(/\breadonly\b/.test(actual) && /\bReadonlyArray\b/.test(expected)))
    return false;
  const readonlyArrayRegExp = /\bReadonlyArray</y;
  const readonlyModifierRegExp = /\breadonly /y;
  let expectedPos = 0;
  let actualPos = 0;
  let depth = 0;
  while (expectedPos < expected.length && actualPos < actual.length) {
    const expectedChar = expected.charAt(expectedPos);
    const actualChar = actual.charAt(actualPos);
    if (expectedChar === actualChar) {
      expectedPos++;
      actualPos++;
      continue;
    }
    if (depth > 0 && expectedChar === ">" && actualChar === "[" && actualPos < actual.length - 1 && actual.charAt(actualPos + 1) === "]") {
      depth--;
      expectedPos++;
      actualPos += 2;
      continue;
    }
    readonlyArrayRegExp.lastIndex = expectedPos;
    readonlyModifierRegExp.lastIndex = actualPos;
    if (readonlyArrayRegExp.test(expected) && readonlyModifierRegExp.test(actual)) {
      depth++;
      expectedPos += 14;
      actualPos += 9;
      continue;
    }
    return false;
  }
  return true;
}
function getExpectTypeFailures(sourceFile, typeAssertions, checker, ts) {
  const unmetExpectations = [];
  ts.forEachChild(sourceFile, function iterate(node) {
    const line = lineOfPosition(node.getStart(sourceFile), sourceFile);
    const expected = typeAssertions.get(line);
    if (expected !== void 0) {
      if (node.kind === ts.SyntaxKind.ExpressionStatement) {
        node = node.expression;
      }
      const type = checker.getTypeAtLocation(getNodeForExpectType(node, ts));
      const actual = type ? checker.typeToString(
        type,
        /*enclosingDeclaration*/
        void 0,
        ts.TypeFormatFlags.NoTruncation
      ) : "";
      if (!expected.split(/\s*\|\|\s*/).some((s) => actual === s || matchReadonlyArray(actual, s))) {
        unmetExpectations.push({ node, expected, actual });
      }
      typeAssertions.delete(line);
    }
    ts.forEachChild(node, iterate);
  });
  return { unmetExpectations, unusedAssertions: typeAssertions.keys() };
}
function getNodeForExpectType(node, ts) {
  if (node.kind === ts.SyntaxKind.VariableStatement) {
    const {
      declarationList: { declarations }
    } = node;
    if (declarations.length === 1) {
      const { initializer } = declarations[0];
      if (initializer) {
        return initializer;
      }
    }
  }
  return node;
}
function lineOfPosition(pos, sourceFile) {
  return sourceFile.getLineAndCharacterOfPosition(pos).line;
}

// src/lint.ts
var assert4 = require("assert");
async function lint(dirPath, minVersion, maxVersion2, isLatest, expectOnly, tsLocal) {
  const tsconfigPath = (0, import_path4.join)(dirPath, "tsconfig.json");
  const estree = await import(require.resolve("@typescript-eslint/typescript-estree", { paths: [dirPath] }));
  process.env.TSESTREE_SINGLE_RUN = "true";
  const lintProgram = import_tslint.Linter.createProgram(tsconfigPath);
  for (const version2 of [maxVersion2, minVersion]) {
    const errors = testDependencies(version2, dirPath, lintProgram, tsLocal);
    if (errors) {
      return errors;
    }
  }
  const linter = new import_tslint.Linter({ fix: false, formatter: "stylish" }, lintProgram);
  const configPath = expectOnly ? (0, import_path4.join)(__dirname, "dtslint-expect-only.json") : getConfigPath(dirPath);
  const config = await getLintConfig(configPath, tsconfigPath, minVersion, maxVersion2, tsLocal);
  const esfiles = [];
  for (const file of lintProgram.getSourceFiles()) {
    if (lintProgram.isSourceFileDefaultLibrary(file)) {
      continue;
    }
    const { fileName, text } = file;
    if (!fileName.includes("node_modules")) {
      const err = testNoTsIgnore(text) || testNoLintDisables("tslint:disable", text) || testNoLintDisables("eslint-disable", text);
      if (err) {
        const { pos, message } = err;
        const place = file.getLineAndCharacterOfPosition(pos);
        return `At ${fileName}:${JSON.stringify(place)}: ${message}`;
      }
    }
    if (!isExternalDependency(file, dirPath, lintProgram) && (!isLatest || !isTypesVersionPath(fileName, dirPath))) {
      linter.lint(fileName, text, config);
      esfiles.push(fileName);
    }
  }
  const result = linter.getResult();
  let output = result.failures.length ? result.output : "";
  if (!expectOnly) {
    const cwd = process.cwd();
    process.chdir(dirPath);
    const eslint = new import_eslint.ESLint({
      rulePaths: [(0, import_path4.join)(__dirname, "./rules/")]
    });
    const formatter = await eslint.loadFormatter("stylish");
    const eresults = await eslint.lintFiles(esfiles);
    output += formatter.format(eresults);
    estree.clearCaches();
    process.chdir(cwd);
  }
  return output;
}
function testDependencies(version2, dirPath, lintProgram, tsLocal) {
  const tsconfigPath = (0, import_path4.join)(dirPath, "tsconfig.json");
  assert4(version2 !== "local" || tsLocal);
  const ts = require((0, import_utils2.typeScriptPath)(version2, tsLocal));
  const program = getProgram(tsconfigPath, ts, version2, lintProgram);
  const diagnostics = ts.getPreEmitDiagnostics(program).filter((d) => !d.file || isExternalDependency(d.file, dirPath, program));
  if (!diagnostics.length) {
    return void 0;
  }
  const showDiags = ts.formatDiagnostics(diagnostics, {
    getCanonicalFileName: (f) => f,
    getCurrentDirectory: () => dirPath,
    getNewLine: () => "\n"
  });
  const message = `Errors in typescript@${version2} for external dependencies:
${showDiags}`;
  const cannotFindDepsDiags = diagnostics.find(
    (d) => d.code === 2307 && d.messageText.toString().includes("Cannot find module")
  );
  if (cannotFindDepsDiags && cannotFindDepsDiags.file) {
    const path2 = cannotFindDepsDiags.file.fileName;
    const typesFolder = (0, import_path4.dirname)(path2);
    return `
A module look-up failed, this often occurs when you need to run \`npm install\` on a dependent module before you can lint.

Before you debug, first try running:

   npm install --prefix ${typesFolder}

Then re-run. Full error logs are below.

${message}`;
  } else {
    return message;
  }
}
function isExternalDependency(file, dirPath, program) {
  return !startsWithDirectory(file.fileName, dirPath) || program.isSourceFileFromExternalLibrary(file);
}
function normalizePath(file) {
  return (0, import_path4.normalize)(file).replace(/\\/g, "/").replace(/^[a-z](?=:)/, (c) => c.toUpperCase());
}
function isTypesVersionPath(fileName, dirPath) {
  const normalFileName = normalizePath(fileName);
  const normalDirPath = normalizePath(dirPath);
  const subdirPath = withoutPrefix(normalFileName, normalDirPath);
  return subdirPath && /^\/ts\d+\.\d/.test(subdirPath);
}
function startsWithDirectory(filePath, dirPath) {
  const normalFilePath = normalizePath(filePath);
  const normalDirPath = normalizePath(dirPath).replace(/\/$/, "");
  return normalFilePath.startsWith(normalDirPath + "/") || normalFilePath.startsWith(normalDirPath + "\\");
}
function testNoTsIgnore(text) {
  const tsIgnore = "ts-ignore";
  const pos = text.indexOf(tsIgnore);
  return pos === -1 ? void 0 : { pos, message: "'ts-ignore' is forbidden." };
}
function testNoLintDisables(disabler, text) {
  let lastIndex = 0;
  while (true) {
    const pos = text.indexOf(disabler, lastIndex);
    if (pos === -1) {
      return void 0;
    }
    const end = pos + disabler.length;
    const nextChar = text.charAt(end);
    const nextChar2 = text.charAt(end + 1);
    if (nextChar !== "-" && !(disabler === "tslint:disable" && nextChar === ":") && !(disabler === "eslint-disable" && nextChar === " " && nextChar2 !== "*")) {
      const message = `'${disabler}' is forbidden. Per-line and per-rule disabling is allowed, for example: 'tslint:disable:rulename', tslint:disable-line' and 'tslint:disable-next-line' are allowed.`;
      return { pos, message };
    }
    lastIndex = end;
  }
}
async function checkTslintJson(dirPath, dt) {
  const configPath = getConfigPath(dirPath);
  const shouldExtend = `@definitelytyped/dtslint/${dt ? "dt" : "dtslint"}.json`;
  const validateExtends = (extend) => extend === shouldExtend || !dt && Array.isArray(extend) && extend.some((val) => val === shouldExtend);
  if (!await (0, import_fs_extra3.pathExists)(configPath)) {
    if (dt) {
      throw new Error(
        `On DefinitelyTyped, must include \`tslint.json\` containing \`{ "extends": "${shouldExtend}" }\`.
This was inferred as a DefinitelyTyped package because it contains a \`// Type definitions for\` header.`
      );
    }
    return;
  }
  const tslintJson = await readJson(configPath);
  if (!validateExtends(tslintJson.extends)) {
    throw new Error(`If 'tslint.json' is present, it should extend "${shouldExtend}"`);
  }
}
function getConfigPath(dirPath) {
  return (0, import_path4.join)(dirPath, "tslint.json");
}
async function getLintConfig(expectedConfigPath, tsconfigPath, minVersion, maxVersion2, tsLocal) {
  const configExists = await (0, import_fs_extra3.pathExists)(expectedConfigPath);
  const configPath = configExists ? expectedConfigPath : (0, import_path4.join)(__dirname, "./dtslint.json");
  const config = import_tslint.Configuration.findConfiguration(configPath, "").results;
  if (!config) {
    throw new Error(`Could not load config at ${configPath}`);
  }
  const expectRule = config.rules.get("expect");
  if (!expectRule || expectRule.ruleSeverity !== "error") {
    throw new Error("'expect' rule should be enabled, else compile errors are ignored");
  }
  if (expectRule) {
    const versionsToTest = range(minVersion, maxVersion2).map((versionName) => ({
      versionName,
      path: (0, import_utils2.typeScriptPath)(versionName, tsLocal)
    }));
    const expectOptions = { tsconfigPath, versionsToTest };
    expectRule.ruleArguments = [expectOptions];
  }
  return config;
}
function range(minVersion, maxVersion2) {
  if (minVersion === "local") {
    assert4(maxVersion2 === "local");
    return ["local"];
  }
  if (minVersion === import_typescript_versions2.TypeScriptVersion.latest) {
    assert4(maxVersion2 === import_typescript_versions2.TypeScriptVersion.latest);
    return [import_typescript_versions2.TypeScriptVersion.latest];
  }
  assert4(maxVersion2 !== "local");
  const minIdx = import_typescript_versions2.TypeScriptVersion.supported.indexOf(minVersion);
  assert4(minIdx >= 0);
  if (maxVersion2 === import_typescript_versions2.TypeScriptVersion.latest) {
    return [...import_typescript_versions2.TypeScriptVersion.supported.slice(minIdx), import_typescript_versions2.TypeScriptVersion.latest];
  }
  const maxIdx = import_typescript_versions2.TypeScriptVersion.supported.indexOf(maxVersion2);
  assert4(maxIdx >= minIdx);
  return import_typescript_versions2.TypeScriptVersion.supported.slice(minIdx, maxIdx + 1);
}

// src/index.ts
var assert5 = require("assert");
async function main() {
  const args = process.argv.slice(2);
  let dirPath = process.cwd();
  let onlyTestTsNext = false;
  let expectOnly = false;
  let shouldListen = false;
  let lookingForTsLocal = false;
  let tsLocal;
  console.log(`dtslint@${require_package().version}`);
  for (const arg of args) {
    if (lookingForTsLocal) {
      if (arg.startsWith("--")) {
        throw new Error("Looking for local path for TS, but got " + arg);
      }
      tsLocal = (0, import_path5.resolve)(arg);
      lookingForTsLocal = false;
      continue;
    }
    switch (arg) {
      case "--installAll":
        console.log("Cleaning old installs and installing for all TypeScript versions...");
        console.log("Working...");
        await cleanTypeScriptInstalls();
        await installAllTypeScriptVersions();
        return;
      case "--localTs":
        lookingForTsLocal = true;
        break;
      case "--version":
        console.log(require_package().version);
        return;
      case "--expectOnly":
        expectOnly = true;
        break;
      case "--onlyTestTsNext":
        onlyTestTsNext = true;
        break;
      case "--listen":
        shouldListen = true;
        break;
      default: {
        if (arg.startsWith("--")) {
          console.error(`Unknown option '${arg}'`);
          usage();
          process.exit(1);
        }
        const path2 = arg.indexOf("@") === 0 && arg.indexOf("/") !== -1 ? (
          // we have a scoped module, e.g. @bla/foo
          // which should be converted to   bla__foo
          arg.slice(1).replace("/", "__")
        ) : arg;
        dirPath = (0, import_path5.join)(dirPath, path2);
      }
    }
  }
  if (lookingForTsLocal) {
    throw new Error("Path for --localTs was not provided.");
  }
  if (shouldListen) {
    listen(dirPath, tsLocal, onlyTestTsNext);
  } else {
    await installTypeScriptAsNeeded(tsLocal, onlyTestTsNext);
    await runTests(dirPath, onlyTestTsNext, expectOnly, tsLocal);
  }
}
async function installTypeScriptAsNeeded(tsLocal, onlyTestTsNext) {
  if (tsLocal)
    return;
  if (onlyTestTsNext) {
    return installTypeScriptNext();
  }
  return installAllTypeScriptVersions();
}
function usage() {
  console.error("Usage: dtslint [--version] [--installAll] [--onlyTestTsNext] [--expectOnly] [--localTs path]");
  console.error("Args:");
  console.error("  --version        Print version and exit.");
  console.error("  --installAll     Cleans and installs all TypeScript versions.");
  console.error("  --expectOnly     Run only the ExpectType lint rule.");
  console.error("  --onlyTestTsNext Only run with `typescript@next`, not with the minimum version.");
  console.error("  --localTs path   Run with *path* as the latest version of TS.");
  console.error("");
  console.error("onlyTestTsNext and localTs are (1) mutually exclusive and (2) test a single version of TS");
}
function listen(dirPath, tsLocal, alwaysOnlyTestTsNext) {
  const installationPromise = installTypeScriptAsNeeded(tsLocal, alwaysOnlyTestTsNext);
  process.on("message", async (message) => {
    const { path: path2, onlyTestTsNext, expectOnly } = message;
    await installationPromise;
    runTests((0, import_path5.join)(dirPath, path2), onlyTestTsNext, !!expectOnly, tsLocal).catch((e) => e.stack).then((maybeError) => {
      process.send({ path: path2, status: maybeError === void 0 ? "OK" : maybeError });
    }).catch((e) => console.error(e.stack));
  });
}
async function runTests(dirPath, onlyTestTsNext, expectOnly, tsLocal) {
  const isOlderVersion = /^v(0\.)?\d+$/.test((0, import_path5.basename)(dirPath));
  const indexText = await (0, import_fs_extra4.readFile)((0, import_path5.join)(dirPath, "index.d.ts"), "utf-8");
  const dt = indexText.includes("// Type definitions for");
  if (dt) {
    const dtRoot = findDTRoot(dirPath);
    const packageName = (0, import_path5.basename)(dirPath);
    assertPathIsInDefinitelyTyped(dirPath, dtRoot);
    assertPathIsNotBanned(packageName);
    assertPackageIsNotDeprecated(packageName, await (0, import_fs_extra4.readFile)((0, import_path5.join)(dtRoot, "notNeededPackages.json"), "utf-8"));
  }
  const typesVersions = await mapDefinedAsync(await (0, import_fs_extra4.readdir)(dirPath), async (name) => {
    if (name === "tsconfig.json" || name === "tslint.json" || name === "tsutils") {
      return void 0;
    }
    const version2 = withoutPrefix(name, "ts");
    if (version2 === void 0 || !(await (0, import_fs_extra4.stat)((0, import_path5.join)(dirPath, name))).isDirectory()) {
      return void 0;
    }
    if (!import_typescript_versions3.TypeScriptVersion.isTypeScriptVersion(version2)) {
      throw new Error(`There is an entry named ${name}, but ${version2} is not a valid TypeScript version.`);
    }
    if (!import_typescript_versions3.TypeScriptVersion.isRedirectable(version2)) {
      throw new Error(`At ${dirPath}/${name}: TypeScript version directories only available starting with ts3.1.`);
    }
    return version2;
  });
  if (dt) {
    await checkPackageJson(dirPath, typesVersions);
  }
  const minVersion = maxVersion(
    getMinimumTypeScriptVersionFromComment(indexText),
    import_typescript_versions3.TypeScriptVersion.lowest
  );
  if (onlyTestTsNext || tsLocal) {
    const tsVersion = tsLocal ? "local" : import_typescript_versions3.TypeScriptVersion.latest;
    await testTypesVersion(
      dirPath,
      tsVersion,
      tsVersion,
      isOlderVersion,
      dt,
      expectOnly,
      tsLocal,
      /*isLatest*/
      true
    );
  } else {
    const lows = [import_typescript_versions3.TypeScriptVersion.lowest, ...typesVersions.map(next)];
    const his = [...typesVersions, import_typescript_versions3.TypeScriptVersion.latest];
    assert5.strictEqual(lows.length, his.length);
    for (let i = 0; i < lows.length; i++) {
      const low = maxVersion(minVersion, lows[i]);
      const hi = his[i];
      assert5(
        parseFloat(hi) >= parseFloat(low),
        `'// Minimum TypeScript Version: ${minVersion}' in header skips ts${hi} folder.`
      );
      const isLatest = hi === import_typescript_versions3.TypeScriptVersion.latest;
      const versionPath = isLatest ? dirPath : (0, import_path5.join)(dirPath, `ts${hi}`);
      if (lows.length > 1) {
        console.log("testing from", low, "to", hi, "in", versionPath);
      }
      await testTypesVersion(versionPath, low, hi, isOlderVersion, dt, expectOnly, void 0, isLatest);
    }
  }
}
function maxVersion(v1, v2) {
  if (!v1)
    return v2;
  if (!v2)
    return v1;
  if (parseFloat(v1) >= parseFloat(v2))
    return v1;
  return v2;
}
function next(v) {
  const index = import_typescript_versions3.TypeScriptVersion.supported.indexOf(v);
  assert5.notStrictEqual(index, -1);
  assert5(index < import_typescript_versions3.TypeScriptVersion.supported.length);
  return import_typescript_versions3.TypeScriptVersion.supported[index + 1];
}
async function testTypesVersion(dirPath, lowVersion, hiVersion, isOlderVersion, dt, expectOnly, tsLocal, isLatest) {
  await checkTslintJson(dirPath, dt);
  checkTsconfig(
    await getCompilerOptions(dirPath),
    dt ? { relativeBaseUrl: ".." + (isOlderVersion ? "/.." : "") + (isLatest ? "" : "/..") + "/" } : void 0
  );
  const err = await lint(dirPath, lowVersion, hiVersion, isLatest, expectOnly, tsLocal);
  if (err) {
    throw new Error(err);
  }
}
function findDTRoot(dirPath) {
  let path2 = dirPath;
  while ((0, import_path5.basename)(path2) !== "types" && (0, import_path5.dirname)(path2) !== "." && (0, import_path5.dirname)(path2) !== "/") {
    path2 = (0, import_path5.dirname)(path2);
  }
  return (0, import_path5.dirname)(path2);
}
function assertPathIsInDefinitelyTyped(dirPath, dtRoot) {
  if (!(0, import_fs_extra4.existsSync)((0, import_path5.join)(dtRoot, "types"))) {
    throw new Error(
      "Since this type definition includes a header (a comment starting with `// Type definitions for`), assumed this was a DefinitelyTyped package.\nBut it is not in a `DefinitelyTyped/types/xxx` directory: " + dirPath
    );
  }
}
function assertPathIsNotBanned(packageName) {
  if (/(^|\W)download($|\W)/.test(packageName) && packageName !== "download" && packageName !== "downloadjs" && packageName !== "s3-download-stream") {
    throw new Error(`${packageName}: Contains the word 'download', which is banned by npm.`);
  }
}
function assertPackageIsNotDeprecated(packageName, notNeededPackages) {
  const unneeded = JSON.parse(notNeededPackages).packages;
  if (Object.keys(unneeded).includes(packageName)) {
    throw new Error(`${packageName}: notNeededPackages.json has an entry for ${packageName}.
That means ${packageName} ships its own types, and @types/${packageName} was deprecated and removed from Definitely Typed.
If you want to re-add @types/${packageName}, please remove its entry from notNeededPackages.json.`);
  }
}
function getMinimumTypeScriptVersionFromComment(text) {
  const match = text.match(/\/\/ (?:Minimum )?TypeScript Version: /);
  if (!match) {
    return void 0;
  }
  let line = text.slice(match.index, text.indexOf("\n", match.index));
  if (line.endsWith("\r")) {
    line = line.slice(0, line.length - 1);
  }
  return (0, import_header_parser2.parseTypeScriptVersionLine)(line);
}
if (!module.parent) {
  main().catch((err) => {
    console.error(err.stack);
    process.exit(1);
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  assertPackageIsNotDeprecated
});
