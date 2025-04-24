import * as vscode from 'vscode';

/**
 * Output channel for logging extension's activity.
 */
let outputChannel: vscode.OutputChannel;

/**
 * Activates the extension.
 * @param {vscode.ExtensionContext} context - The extension context.
 */
export function activate(context: vscode.ExtensionContext) {
	outputChannel = vscode.window.createOutputChannel('KeyLang Replacer');
	context.subscriptions.push(outputChannel);

	const disposable = vscode.commands.registerCommand(
		'extension.replaceTranslationsWithJSON',
		async () => {
			// Clear the output channel
			outputChannel.clear();
			outputChannel.show(true);
			outputChannel.appendLine(
				'Command replaceTranslationsWithJSON started.',
			);

			// Ask the user to select a JSON file with the mapping
			const uris = await vscode.window.showOpenDialog({
				canSelectMany: false,
				filters: { 'JSON Files': ['json'] },
				openLabel: 'Select mapping JSON',
			});

			if (!uris || uris.length === 0) {
				vscode.window.showWarningMessage('No file selected, exiting.');
				return;
			}

			const fileUri = uris[0];

			let mapping: Record<string, string>;
			try {
				// Read the file and parse it as JSON
				const fileBytes = await vscode.workspace.fs.readFile(fileUri);
				const json = Buffer.from(fileBytes).toString('utf8');

				mapping = JSON.parse(json);

				outputChannel.appendLine(
					`Loaded mapping from ${fileUri.fsPath}`,
				);
			} catch (e) {
				// Show an error message if the file is not a valid JSON
				vscode.window.showErrorMessage('Invalid JSON in file');

				outputChannel.appendLine(
					`Failed to parse JSON from ${fileUri.fsPath}`,
				);
				return;
			}

			// Find all files in the workspace with the extensions .js, .ts, .jsx, .tsx
			const files = await vscode.workspace.findFiles(
				'**/*.{js,ts,jsx,tsx}',
				'**/{node_modules,public}/**',
			);

			outputChannel.appendLine(`Found ${files.length} files to process.`);

			for (const uri of files) {
				const doc = await vscode.workspace.openTextDocument(uri);

				if (doc.isUntitled || doc.isClosed) {
					continue;
				}

				if (
					![
						'javascript',
						'typescript',
						'javascriptreact',
						'typescriptreact',
					].includes(doc.languageId)
				) {
					outputChannel.appendLine(
						`Skipping ${doc.fileName}: unsupported language ${doc.languageId}`,
					);
					continue;
				}

				const text = doc.getText();
				const edit = new vscode.WorkspaceEdit();
				// Regular expression to match JSON blocks with en and ar properties
				const regex =
					/([A-Za-z0-9_]+\s*:\s*\{(?=[^}]*\ben\s*:\s*"([^"]*)")(?:[^}]*?\bar\s*:\s*"([^"]*)")[\s\S]*?\})/g;

				let match: RegExpExecArray | null;
				let replacedCount = 0;

				while ((match = regex.exec(text))) {
					const fullBlock = match[1];
					const enValue = match[2];
					const arValue = match[3];

					outputChannel.appendLine(
						`Found block at ${doc.fileName}:${
							doc.positionAt(match.index).line + 1
						}, en="${enValue}", ar="${arValue}"`,
					);

					if (mapping[enValue]) {
						const rawAr = mapping[enValue];
						const newAr = rawAr
							.trim()
							.replace(/^"+|"+$/g, '')
							.replace(/"/g, '\\"');
						const updatedBlock = fullBlock.replace(
							/\bar\s*:\s*"[^"]*"/,
							`ar: "${newAr}"`,
						);
						const startPos = doc.positionAt(match.index);
						const endPos = doc.positionAt(
							match.index + fullBlock.length,
						);

						edit.replace(
							doc.uri,
							new vscode.Range(startPos, endPos),
							updatedBlock,
						);

						outputChannel.appendLine(
							`Replaced ar value with "${newAr}"`,
						);

						replacedCount++;
					}
				}

				if (replacedCount > 0) {
					// Apply the replacements to the document
					await vscode.workspace.applyEdit(edit);
					await doc.save();

					outputChannel.appendLine(
						`Applied ${replacedCount} replacements in ${doc.fileName}`,
					);
				} else {
					outputChannel.appendLine(
						`No replacements needed in ${doc.fileName}`,
					);
				}
			}

			outputChannel.appendLine(
				'Command replaceTranslationsWithJSON completed.',
			);
			vscode.window.showInformationMessage('Arabic values replaced!');
		},
	);

	context.subscriptions.push(disposable);
}

/**
 * Deactivates the extension.
 */
export function deactivate() {}
