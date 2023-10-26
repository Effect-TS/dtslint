# Setup

- create `dtslint` folder
- create `dtslint/tsconfig.json` file, example:
  ```json
  {
    "compilerOptions": {
      "skipLibCheck": true,
      "noEmit": true,
      "strict": true
    }
  }
  ```
- put tests files into `dtslint`
- add the following scripts to `package.json`
  ```json
  {
    "dtslint": "dtslint",
    "dtslint-clean": "dtslint --installAll"
  }
  ```
