import { Console, Effect, identity } from "effect"
import * as path from "node:path"
import * as FileSystem from "./FileSystem"

const moveJson = (from: string, to: string, modify: (json: any) => any) =>
  Console.log(`moving ${from} to ${to}`).pipe(
    Effect.flatMap(() => FileSystem.readJsonFile(from)),
    Effect.map(modify),
    Effect.flatMap((json) => FileSystem.writeFile(to, JSON.stringify(json, null, 2)))
  )

const packageJson = moveJson("package.json", path.join("dist", "package.json"), (json: any) => ({
  name: json.name,
  version: json.version,
  description: json.description,
  main: "index.js",
  bin: "index.js",
  engines: json.engines,
  dependencies: json.dependencies,
  peerDependencies: json.peerDependencies,
  repository: json.repository,
  author: json.author,
  license: json.license,
  bugs: json.bugs,
  homepage: json.homepage,
  tags: json.tags,
  keywords: json.keywords
}))

const dtslintJson = moveJson(
  path.join("src", "dtslint.json"),
  path.join("dist", "dtslint.json"),
  identity
)

const program = packageJson.pipe(Effect.flatMap(() => dtslintJson))

Effect.runPromise(program)
