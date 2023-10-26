/**
 * @since 0.9.0
 */
import { Effect, Either, pipe } from "effect"
import * as fs from "fs-extra"

/**
 * Represents a file which can be optionally overwriteable.
 *
 * @category model
 * @since 0.9.0
 */
export interface File {
  readonly path: string
  readonly content: string
  readonly overwrite: boolean
}

/**
 * By default files are readonly (`overwrite = false`).
 *
 * @category constructors
 * @since 0.9.0
 */
export const createFile = (
  path: string,
  content: string,
  overwrite = false
): File => ({
  path,
  content,
  overwrite
})

/** @internal */
export const readFile = (path: string): Effect.Effect<never, Error, string> =>
  Effect.async((resume) =>
    fs.readFile(path, "utf8", (error, data) => {
      if (error) {
        resume(Effect.fail(error))
      } else {
        resume(Effect.succeed(data))
      }
    })
  )

/**
 * read a JSON file and parse the content
 *
 * @internal
 */
export const readJsonFile = (path: string): Effect.Effect<never, Error, unknown> =>
  pipe(
    readFile(path),
    Effect.flatMap((content) =>
      Either.try({
        try: () => JSON.parse(content),
        catch: (e) => e instanceof Error ? e : new Error(String(e))
      })
    )
  )

/** @internal */
export const writeFile = (
  path: string,
  content: string
): Effect.Effect<never, Error, void> =>
  Effect.async((resume) =>
    fs.outputFile(path, content, { encoding: "utf8" }, (error) => {
      if (error) {
        resume(Effect.fail(error))
      } else {
        resume(Effect.succeed(undefined))
      }
    })
  )
