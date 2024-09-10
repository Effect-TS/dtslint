# Disclaimer

> [!WARNING]
> This tool is not intended for public consumption, so we may break the API whenever convenient for us.

# Setting up the Environment

To get started with `dtslint`, follow these steps to set up your development environment:

## 1. Create a `dtslint` Folder

Begin by creating a folder named `dtslint`. This folder will be the home for your TypeScript declaration files (`.d.ts`) and configuration.

## 2. Configure TypeScript

Inside the `dtslint` folder, create a `tsconfig.json` file. Here's an example of what it should contain:

```json
{
  "compilerOptions": {
    "skipLibCheck": true,
    "noEmit": true,
    "strict": true
  }
}
```

This configuration file is essential for TypeScript to understand how to handle your declaration files during linting.

## 3. Add Test Files

Place your TypeScript declaration files that you want to lint inside the `dtslint` folder. These files will be checked for correct TypeScript typings.

## 4. Update `package.json`

Finally, update your project's `package.json` file with the following scripts:

```json
{
  "scripts": {
    "dtslint": "dtslint",
    "dtslint-installAll": "dtslint --installAll",
    "dtslint-clean": "dtslint --clean"
  }
}
```

These scripts allow you to run `dtslint` and perform necessary linting checks on your TypeScript declaration files.

Flags:

- `--installAll`: Installs all necessary dependencies, including those labeled as `next` and `rc`.
- `--clean`: Clears all installations, ensuring a clean slate for subsequent operations.
