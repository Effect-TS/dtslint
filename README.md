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
    "dtslint-clean": "dtslint --installAll"
  }
}
```

These scripts allow you to run `dtslint` and perform necessary linting checks on your TypeScript declaration files. Additionally, the `dtslint-clean` script is used to ensure that all required TypeScript versions are properly installed.
