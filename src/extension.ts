// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import generateTree from './directoryTree';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('md-directory-tree.helloWorld', async (resource) => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		// let tree = new Tree(resource.path, 0);
		// await tree.buildPathTree();
		let exceptions = vscode.workspace.getConfiguration("md-directory-tree");
		let s = await generateTree(resource.path, 0, exceptions.ignoredList);
		// vscode.window.showInformationMessage("Hellow World!");
		return vscode.workspace.fs.writeFile(vscode.Uri.parse(resource.path + '/structure.txt'), new TextEncoder().encode(s));
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
