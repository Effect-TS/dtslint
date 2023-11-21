#!/usr/bin/env node

import { exec } from "child_process"
import * as fs from "fs-extra"
import * as NodePath from "node:path"
import * as os from "os"
import { Configuration, Linter } from "tslint"
import type TsType from "typescript"
import type { Options as ExpectOptions } from "./expectRule"

namespace TypeScriptVersion {
  /** Add to this list when a version actually ships.  */
  export const shipped = [
    "5.0",
    "5.1",
    "5.2",
    "5.3"
  ] as const
  /** Add to this list when a version is available as typescript@next */
  export const supported = [...shipped, "5.4"] as const

  export const latest = supported[supported.length - 1]
}

type TypeScriptVersion = (typeof TypeScriptVersion.supported)[number]

type Configuration = typeof Configuration
type IConfigurationFile = Configuration.IConfigurationFile

const installsDir = NodePath.join(os.homedir(), ".dts", "typescript-installs")

main().catch((err) => {
  console.error(err.stack)
  process.exit(1)
})

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  let dirPath = process.cwd()

  for (const arg of args) {
    switch (arg) {
      case "--installAll":
        console.log("Cleaning old installs and installing for all TypeScript versions...")
        await cleanTypeScriptInstalls()
        await installAllTypeScriptVersions()
        return
      default: {
        if (arg.startsWith("--")) {
          console.error(`Unknown option '${arg}'`)
          process.exit(1)
        }

        const path = arg
        dirPath = NodePath.join(dirPath, path)
      }
    }
  }

  await installAllTypeScriptVersions()
  const err = lint(dirPath, TypeScriptVersion.supported)
  if (err) {
    throw new Error(err)
  }
}

function lint(
  dirPath: string,
  versions: ReadonlyArray<TypeScriptVersion>
) {
  const tsconfigPath = NodePath.join(dirPath, "tsconfig.json")
  const lintProgram = Linter.createProgram(tsconfigPath)
  const linter = new Linter({ fix: false, formatter: "stylish" }, lintProgram)
  const config = getLintConfig(tsconfigPath, versions)
  for (const file of lintProgram.getSourceFiles()) {
    // External dependencies should have been handled by `testDependencies`;
    if (!isExternalDependency(file, dirPath, lintProgram)) {
      const { fileName, text } = file
      console.log(`[INFO] linting ${NodePath.basename(fileName)}...`)
      linter.lint(fileName, text, config)
    }
  }
  const result = linter.getResult()
  const output = result.failures.length ? result.output : ""
  return output
}

function isExternalDependency(
  file: TsType.SourceFile,
  dirPath: string,
  program: TsType.Program
): boolean {
  return !startsWithDirectory(file.fileName, dirPath) ||
    program.isSourceFileFromExternalLibrary(file)
}

function startsWithDirectory(filePath: string, dirPath: string): boolean {
  const normalFilePath = normalizePath(filePath)
  const normalDirPath = normalizePath(dirPath).replace(/\/$/, "")
  return normalFilePath.startsWith(normalDirPath + "/") ||
    normalFilePath.startsWith(normalDirPath + "\\")
}

function normalizePath(file: string) {
  // replaces '\' with '/' and forces all DOS drive letters to be upper-case
  return NodePath.normalize(file)
    .replace(/\\/g, "/")
    .replace(/^[a-z](?=:)/, (c) => c.toUpperCase())
}

function getLintConfig(
  tsconfigPath: string,
  versions: ReadonlyArray<TypeScriptVersion>
): IConfigurationFile {
  const configPath = NodePath.join(__dirname, "dtslint.json")
  // Second param to `findConfiguration` doesn't matter, since config path is provided.
  const config = Configuration.findConfiguration(configPath, "").results
  if (!config) {
    throw new Error(`Could not load config at ${configPath}`)
  }

  const expectRule = config.rules.get("expect")
  if (!expectRule) {
    throw new Error("'expect' rule should be enabled, else compile errors are ignored")
  }
  const versionsToTest = versions.map((versionName) => ({
    versionName,
    path: typeScriptPath(versionName)
  }))
  const expectOptions: ExpectOptions = { tsconfigPath, versionsToTest }
  expectRule.ruleArguments = [expectOptions]
  return config
}

function typeScriptPath(
  version: TypeScriptVersion | "next" | "rc"
): string {
  return NodePath.join(installDir(version), "node_modules", "typescript")
}

function installDir(version: TypeScriptVersion | "next" | "rc"): string {
  if (version === "next") version = TypeScriptVersion.latest
  if (version === "rc") {
    version = TypeScriptVersion.supported[TypeScriptVersion.supported.length - 2]
  }
  return NodePath.join(installsDir, version)
}

function cleanTypeScriptInstalls(): Promise<void> {
  return fs.remove(installsDir)
}

async function install(version: TypeScriptVersion | "next" | "rc"): Promise<void> {
  const dir = installDir(version)
  if (!(await fs.pathExists(dir))) {
    console.log(`Installing to ${dir}...`)
    await fs.mkdirp(dir)
    await fs.writeJson(NodePath.join(dir, "package.json"), {
      description: `Installs typescript@${version}`,
      repository: "N/A",
      license: "MIT",
      dependencies: {
        typescript: version
      }
    })
    await execAndThrowErrors(
      "npm install --ignore-scripts --no-shrinkwrap --no-package-lock --no-bin-links",
      dir
    )
    console.log("Installed!")
  }
}

/** Run a command and return the stdout, or if there was an error, throw. */
async function execAndThrowErrors(cmd: string, cwd?: string): Promise<void> {
  // tslint:disable-next-line:promise-must-complete
  return new Promise<void>((resolve, reject) => {
    const env = { ...process.env }
    if (env.NODE_OPTIONS && env.NODE_OPTIONS.includes("--require")) {
      delete env.NODE_OPTIONS
    }
    exec(cmd, { encoding: "utf8", cwd, env }, (err, _stdout, stderr) => {
      if (stderr) {
        console.error(stderr)
      }

      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

async function installAllTypeScriptVersions() {
  for (const v of TypeScriptVersion.shipped) {
    await install(v)
  }
  // `shipped + [rc, next] == supported` during the RC period. During that time, typescript@rc needs to be installed too.
  if (TypeScriptVersion.shipped.length + 2 === TypeScriptVersion.supported.length) {
    await install("rc")
  }
  await installTypeScriptNext()
}

export async function installTypeScriptNext() {
  await install("next")
}
