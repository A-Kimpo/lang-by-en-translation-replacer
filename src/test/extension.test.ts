import * as assert from 'assert';
import * as vscode from 'vscode';
import * as extension from '../extension';
import { workspace, TextDocument, WorkspaceEdit } from 'vscode';

describe('Translations Replacer Extension', () => {
	const sampleContent = `
foo: {
  en: "Standard",
  ar: "Standard",
}
bar: { en: "Price", ar: "Price" }
`;
	let doc: TextDocument;

	before(async () => {
		// Create a temporary in-memory document
		doc = await workspace.openTextDocument({
			content: sampleContent,
			language: 'typescript',
		});
		await vscode.window.showTextDocument(doc);
	});

	it('should match blocks with en and ar values', () => {
		const regex =
			/([A-Za-z0-9_]+\s*:\s*\{(?=[^}]*\ben\s*:\s*"([^"]*)")(?:[^}]*?\bar\s*:\s*"([^"]*)")[\s\S]*?\})/g;
		const text = doc.getText();
		const matches = [...text.matchAll(regex)];

		assert.strictEqual(matches.length, 2, 'Should find two blocks');
		assert.strictEqual(matches[0][2], 'Standard');
		assert.strictEqual(matches[1][2], 'Price');
	});

	it('should replace ar values according to mapping', async () => {
		const mapping = { Standard: 'معيار', Price: 'سعر' };
		const text = doc.getText();

		let newText = text;
		const regex =
			/([A-Za-z0-9_]+\s*:\s*\{(?=[^}]*\ben\s*:\s*"([^"]*)")(?:[^}]*?\bar\s*:\s*"([^"]*)")[\s\S]*?\})/g;

		newText = newText.replace(
			regex,
			(fullMatch, block, enValue: keyof typeof mapping) => {
				if (mapping[enValue]) {
					return block.replace(
						/\bar\s*:\s*"[^"]*"/,
						`ar: "${mapping[enValue]}"`,
					);
				}
				return fullMatch;
			},
		);

		assert.ok(
			newText.includes('ar: "معيار"'),
			'Standard should be replaced with معيار',
		);
		assert.ok(
			newText.includes('ar: "سعر"'),
			'Price should be replaced with سعر',
		);
	});
});

