# Lang by En-key Translations Replacer VS Code Extension

## Description

**Lang by En-key Translations Replacer** is a Visual Studio Code extension that automatically updates Arabic translations (`ar`) based on their corresponding English values (`en`) using a user-provided JSON mapping.

The extension:

* Scans all `.js`, `.ts`, `.jsx`, and `.tsx` files in your workspace, excluding `node_modules` and `public` folders.
* Detects translation blocks of the form:
  ```js
  key: {
    en: "EnglishValue",
    ar: "ArabicValue",
    // other properties…
  }
  ```
* Replaces `ar` values with new strings from a JSON mapping file. (Ar only now)
* Logs detailed actions in the **Lang by En-key Translations Replacer** output channel.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/A-Kimpo/lang-by-en-translation-replacer
   cd lang-by-en-translation-replacer
   ```
2. Install dependencies and compile:
   ```bash
   npm install
   npm run compile
   ```
3. Package the extension:
   ```bash
   npx vsce package
   ```
4. In VS Code, open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`) and choose  **Extensions: Install from VSIX...** , then select the generated `.vsix` file.

## Usage

1. Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`) and run  **Replace Lang Keys With JSON**. (Ar only now)
2. Select your JSON mapping file in the file picker. The JSON should be in the format:
   ```json
   {
     "Standard": "معيار",
     "Price": "سعر"
   }
   ```
3. The extension will process all translation blocks and apply replacements.
4. Go to **View → Output** (`Ctrl+Shift+U` or `Cmd+Shift+U`) and select **Lang by En-key Translations Replacer** to review logs.

## Configuration

Your `package.json` should include:

```jsonc
"activationEvents": [
  "onCommand:extension.replaceLangWithJSON"
],
"contributes": {
  "commands": [
    {
      "command": "extension.replaceLangWithJSON",
      "title": "Replace Lang Keys With JSON"
    }
  ]
}
```

## Development

* **Debug** : Press `F5` in VS Code to open an Extension Development Host.
* **Command implementation** :

1. `activate()` creates an `OutputChannel` and registers the command.
2. On command execution, users pick a JSON file.
3. JSON is read and parsed into a mapping object.
4. `findFiles` collects all relevant files in the workspace.
5. A regex locates translation blocks; matches are replaced by `WorkspaceEdit` and files are saved.

## Testing

Basic unit tests are located in `src/test/extension.test.ts`. To run tests:

1. Ensure `tsconfig.json` has `module: commonjs` and `rootDir: src, outDir: out`.
2. Run:
   ```bash
   npm install
   npm test
   ```

The test suite uses Mocha and `ts-node` to execute TypeScript tests directly.

## License

MIT © Aleksey Kondakov
