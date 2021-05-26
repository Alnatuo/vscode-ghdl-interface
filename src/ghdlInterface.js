// MIT License

// Copyright (c) 2020 Johannes Bonk

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

const vscode = require('vscode');
const path = require('path'); 
const { exec } = require('child_process');
const lineDecorationType = vscode.window.createTextEditorDecorationType({
	overviewRulerColor: 'red',
	overviewRulerLane: vscode.OverviewRulerLane.Right,
	light: {
		border: '2px dashed black',
	},
	dark: {
		border: '2px dashed white',
	}
});
const largeDecorationType = vscode.window.createTextEditorDecorationType({
	color: 'black',
	overviewRulerColor: 'red',
	overviewRulerLane: vscode.OverviewRulerLane.Right,
	backgroundColor: 'red',
	light: {
		border: '2px solid black',
	},
	dark: {
		border: '2px solid white',
	}
});
const smallDecorationType = vscode.window.createTextEditorDecorationType({
	overviewRulerColor: 'red',
	overviewRulerLane: vscode.OverviewRulerLane.Right,
	border: '1px solid red'
});
const ghwDialogOptions = {
	canSelectMany: false,
	openLabel: 'Open',
	filters: {
	   'ghw files': ['ghw']
   }
};
const importDialogOptions = {
	canSelectMany: true,
	openLabel: 'Open',
	filters: {
	   'vhd files': ['vhd']
   }
};
const LinkedList = require('./util/linkedlist/LinkedList'); 
const ErrorData = require('./util/linkedlist/ErrorData'); 
const Settings = require('./settings/Settings');

let output;
  
// this method is called when vs code is activated
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	console.log('ghdl-interface now active!'); // log extension start

	output = vscode.window.createOutputChannel("GHDL");

	let disposableEditorImport = vscode.commands.registerCommand('extension.editor_ghdl-import_files', async function () {
		const filePathEditor = vscode.window.activeTextEditor.document.uri.fsPath; // get file path of the currently opened file
		await vscode.window.activeTextEditor.document.save(); //save open file before importing it
		importFiles(filePathEditor); 
	});
	/*let disposableExplorerImport = vscode.commands.registerCommand('extension.explorer_ghdl-import_files', async (element) => {
		const filePathExplorer = element.fsPath;
		await vscode.window.activeTextEditor.document.save(); //save open file importing analyzing
		importFiles(filePathExplorer);  
	});*/

	context.subscriptions.push(disposableEditorImport);
	//context.subscriptions.push(disposableExplorerImport); 

	let disposableEditorAnalyze = vscode.commands.registerCommand('extension.editor_ghdl-analyze_file', async function () {
		const filePathEditor = vscode.window.activeTextEditor.document.uri.fsPath; // get file path of the currently opened file
		await vscode.window.activeTextEditor.document.save(); //save open file before analyzing it
		removeDecorations(); // remove old decorations before adding new ones
		analyzeFile(filePathEditor); 
	});
	/*let disposableExplorerAnalyze = vscode.commands.registerCommand('extension.explorer_ghdl-analyze_file', async (element) => {
		const filePathExplorer = element.fsPath;
		await vscode.window.activeTextEditor.document.save(); //save open file before analyzing
		removeDecorations(); // remove old decorations before adding new ones
		analyzeFile(filePathExplorer);  
	});*/

	context.subscriptions.push(disposableEditorAnalyze);
	//context.subscriptions.push(disposableExplorerAnalyze); 

	let disposableEditorElaborate = vscode.commands.registerCommand('extension.editor_ghdl-elaborate_file', async (element) => {
		const filePathEditor = vscode.window.activeTextEditor.document.uri.fsPath; // get file path of the currently opened file
		elaborateFiles(filePathEditor); 
	});
	/*let disposableExplorerElaborate = vscode.commands.registerCommand('extension.explorer_ghdl-elaborate_file', async (element) => {
		const filePathExplorer = element.fsPath;
		elaborateFiles(filePathExplorer); 
	});*/

	context.subscriptions.push(disposableEditorElaborate);
	//context.subscriptions.push(disposableExplorerElaborate);
	
	let disposableEditorMake = vscode.commands.registerCommand('extension.editor_ghdl-make_unit', async function () {
		const filePathEditor = vscode.window.activeTextEditor.document.uri.fsPath; // get file path of the currently opened file
		await vscode.window.activeTextEditor.document.save(); //save open file before importing it
		makeUnit(filePathEditor); 
	});
	/*let disposableExplorerMake = vscode.commands.registerCommand('extension.explorer_ghdl-make_unit', async (element) => {
		const filePathExplorer = element.fsPath;
		await vscode.window.activeTextEditor.document.save(); //save open file importing analyzing
		makeUnit(filePathExplorer);  
	});*/

	context.subscriptions.push(disposableEditorMake);
	//context.subscriptions.push(disposableExplorerMake); 

	let disposableEditorRunUnit = vscode.commands.registerCommand('extension.editor_ghdl-run_unit', async (element) => {
		const filePathEditor = vscode.window.activeTextEditor.document.uri.fsPath; // get file path of the currently opened file
		runUnit(filePathEditor); 
	});
	/*let disposableExplorerRunUnit = vscode.commands.registerCommand('extension.explorer_ghdl-run_unit', async (element) => {
		const filePathExplorer = element.fsPath;
		runUnit(filePathExplorer); 
	});*/

	context.subscriptions.push(disposableEditorRunUnit);
	//context.subscriptions.push(disposableExplorerRunUnit);
	
	let disposableEditorQuickRunUnit = vscode.commands.registerCommand('extension.editor_ghdl-quick-run_unit', async (element) => {
		const filePathEditor = vscode.window.activeTextEditor.document.uri.fsPath; // get file path of the currently opened file
		await vscode.window.activeTextEditor.document.save();
		quickRunUnit(filePathEditor); 
	});
	let disposableExplorerQuickRunUnit = vscode.commands.registerCommand('extension.explorer_ghdl-quick-run_unit', async (element) => {
		const filePathExplorer = element.fsPath;
		await vscode.window.activeTextEditor.document.save();
		quickRunUnit(filePathExplorer); 
	});

	context.subscriptions.push(disposableEditorQuickRunUnit);
	context.subscriptions.push(disposableExplorerQuickRunUnit);
	
	let disposableEditorClean = vscode.commands.registerCommand('extension.editor_ghdl-clean', async (element) => {
		const filePathEditor = vscode.window.activeTextEditor.document.uri.fsPath;
		cleanGeneratedFiles(filePathEditor); 
	});
	/*let disposableExplorerClean = vscode.commands.registerCommand('extension.explorer_ghdl-clean', async (element) => {
		const filePathExplorer = element.fsPath;
		await vscode.window.activeTextEditor.document.save(); //save open file before analyzing
		removeDecorations(); // remove old decorations before adding new ones
		cleanGeneratedFiles(filePathExplorer); 
	});*/

	context.subscriptions.push(disposableEditorClean); 
	//context.subscriptions.push(disposableExplorerClean);

	let disposableEditorRemove = vscode.commands.registerCommand('extension.editor_ghdl-remove', async (element) => {
		const filePathEditor = vscode.window.activeTextEditor.document.uri.fsPath;
		removeGeneratedFiles(filePathEditor); 
	});
	let disposableExplorerRemove = vscode.commands.registerCommand('extension.explorer_ghdl-remove', async (element) => {
		const filePathExplorer = element.fsPath;
		removeGeneratedFiles(filePathExplorer); 
	});

	context.subscriptions.push(disposableEditorRemove); 
	context.subscriptions.push(disposableExplorerRemove);

	let disposableExplorerGtkwave = vscode.commands.registerCommand('extension.explorer_gtkwave', async (element) => {
		const filePathExplorer = element.fsPath;
		invokeGTKWave(filePathExplorer); 
	});

	context.subscriptions.push(disposableExplorerGtkwave);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}

/*
**Function: importFiles
**usage: invokes ghdl to import files from setting in filePath directory
**parameter: path of a file in folder to import from
**return value(s): none
*/
/**
 * @param {string} filePath
 */
function importFiles(filePath){
	const settings = new Settings(vscode);
	const fileImports = settings.getImportFiles();
	const dirPath = filePath.substring(0, filePath.lastIndexOf("\\")); 
	//TODO UI-Prompt
	const command = 'ghdl -i '+fileImports;
	console.log(command)
	exec(command, {cwd: dirPath}, async (err, stdout, stderr) => {
		if(err) {
			vscode.window.showErrorMessage(stderr);
    		return;
		} else {
			vscode.window.showInformationMessage(fileImports + ' imported successfully without errors');
		}
	});
}

/*
**Function: analyzeFile
**usage: invokes ghdl to analyze file from filePath parameter
**parameter: path of the file to analyze
**return value(s): none
*/
/**
 * @param {string} filePath
 */
function analyzeFile(filePath) {
	const settings = new Settings(vscode)
	const userOptions = settings.getSettingsString(settings.TaskEnum.analyze) //get user specific settings
	//const dirPath = vscode.workspace.rootPath;
	const dirPath = filePath.substring(0, filePath.lastIndexOf("\\")); 
	const fileName = path.basename(filePath); 
	const command = 'ghdl -a ' + userOptions + ' ' + '"' + filePath + '"'; //command to execute
	console.log(command);
	exec(command, {cwd: dirPath}, async (err, stdout, stderr) => { // execute command at workspace directory
  		if (err) {
			if(vscode.window.activeTextEditor.document.uri.fsPath != filePath) { // open analyzed file in editor, if ghdl analyze was invoked by explorer, with the file not open, and errors occured
				let doc = await vscode.workspace.openTextDocument(filePath);
				await vscode.window.showTextDocument(doc); // wait till text editor is shown and set as active editor
			}
			showErrors(err); // highlightes the errors in the editor
			vscode.window.showErrorMessage(stderr);
    		return;
  		} else {
			vscode.window.showInformationMessage(fileName + ' analyzed successfully without errors');
		}
	});
}

/*
**Function: elaborateFiles
**usage: elaborates the unit of the analyzed vhdl source file
**parameter: path of the file that was analyzed
**return value(s): none
*/
/**
 * @param {string} filePath
 */
function elaborateFiles(filePath) {
	const settings = new Settings(vscode)
	const userOptions = settings.getSettingsString(settings.TaskEnum.elaborate) //get user specific settings
	//const dirPath = vscode.workspace.rootPath;
	const dirPath = filePath.substring(0, filePath.lastIndexOf("\\"));  
	const fileName = path.basename(filePath);
	const unitName = fileName.substr(0, fileName.lastIndexOf("."));
	const command = 'ghdl -e ' + userOptions + ' ' + unitName; //command to execute (elaborate vhdl file)
	console.log(command);
	exec(command, {cwd: dirPath}, async (err, stdout, stderr) => { // execute command at workspace directory
  		if (err) {
			vscode.window.showErrorMessage(stderr);
    		return;
  		} else {
			vscode.window.showInformationMessage(unitName + ' elaborated successfully without errors');
		}
	});
}

/*
**Function: makeUnit
**usage: makes the unit with all imported dependencies
**parameter: path of the file that was imported
**return value(s): none
*/
/**
 * @param {string} filePath
 */
 function makeUnit(filePath){
	const settings = new Settings(vscode)
	const userOptions = settings.getSettingsString(settings.TaskEnum.make) //get user specific settings
	//const dirPath = vscode.workspace.rootPath;
	const dirPath = filePath.substring(0, filePath.lastIndexOf("\\"));  
	const fileName = path.basename(filePath);
	const unitName = fileName.substr(0, fileName.lastIndexOf("."));
	const command = 'ghdl -m ' + userOptions + ' ' + unitName; //command to execute (make unit)
	console.log(command);
	exec(command, {cwd: dirPath}, async (err, stdout, stderr) => { // execute command at workspace directory
		if (err) {
			vscode.window.showErrorMessage(stderr);
			return;
		} else {
			vscode.window.showInformationMessage(unitName + ' made successfully without errors');
		}
	});
}

/*
**Function: runUnit
**usage: runs the testbench unit and exports to ghw file 
**parameter: path of the file that was analyzed
**return value(s): none
*/
/**
 * @param {string} filePath
*/
function runUnit(filePath) {
	const settings = new Settings(vscode)
	const userOptions = settings.getSettingsString(settings.TaskEnum.run) //get user specific settings
	const autoGHW = settings.getAutoGHW();
	const autoGTKWave = settings.getAutoGTKWave();
	//const dirPath = vscode.workspace.rootPath;
	const dirPath = filePath.substring(0, filePath.lastIndexOf("\\"));  
	const fileName = path.basename(filePath);
	const unitName = fileName.substr(0, fileName.lastIndexOf("."));
	output.show();
	if (!autoGHW) {
		vscode.window.showSaveDialog(ghwDialogOptions).then(fileInfos => {
			const simFilePath = fileInfos.fsPath;
			const command = 'ghdl -r ' + userOptions + ' ' + unitName + ' ' + '--wave=' + '"' + simFilePath + '"'; //command to execute (run unit)
			console.log(command);
			output.appendLine(command);
			exec(command, {cwd: dirPath}, async (err, stdout, stderr) => { // execute command at workspace directory
				output.append(stderr);
				if (err) {
					vscode.window.showErrorMessage(stderr);
					return;
				} else {
					vscode.window.showInformationMessage(unitName + ' elaborated successfully without errors');
					if (autoGTKWave) {
						invokeGTKWave(simFilePath)
					}
				}
			});
		});
	} else {
		const simFilePath = unitName+".ghw";
		const command = 'ghdl -r ' + userOptions + ' ' + unitName + ' ' + '--wave=' + '"' + simFilePath + '"'; //command to execute (run unit)
		console.log(command);
		output.appendLine(command);
		exec(command, {cwd: dirPath}, async (err, stdout, stderr) => { // execute command at workspace directory
			output.append(stderr);
			if (err) {
				vscode.window.showErrorMessage(stderr);
				return;
			} else {
				vscode.window.showInformationMessage(unitName + ' elaborated successfully without errors');
				if (autoGTKWave) {
					invokeGTKWave(dirPath+"\\"+simFilePath)
				}
			}
		});
	}
}

/*
**Function: quickRunUnit
**usage: imports files, makes unit and runs the testbench unit and exports to ghw file 
**parameter: path of the file to be run
**return value(s): none
*/
/**
 * @param {string} filePath
 */
 function quickRunUnit(filePath) {
	//MAYBE-DO: Use Methods instead of duplicate code
	const settings = new Settings(vscode);
	const fileImports = settings.getImportFiles();
	const dirPath = filePath.substring(0, filePath.lastIndexOf("\\")); 
	//TODO: UI-Prompt
	const command = 'ghdl -i '+fileImports;
	console.log(command)
	exec(command, {cwd: dirPath}, async (err, stdout, stderr) => {
		if(err) {
			vscode.window.showErrorMessage(stderr);
			if(settings.getAutoRemove()) {
				removeGeneratedFiles(filePath);
			}
    		return;
		} else {
			vscode.window.showInformationMessage(fileImports + ' imported successfully without errors');
			const settings = new Settings(vscode)
			const userOptions = settings.getSettingsString(settings.TaskEnum.make) //get user specific settings
			//const dirPath = vscode.workspace.rootPath;
			const dirPath = filePath.substring(0, filePath.lastIndexOf("\\"));  
			const fileName = path.basename(filePath);
			const unitName = fileName.substr(0, fileName.lastIndexOf("."));
			const command = 'ghdl -m ' + userOptions + ' ' + unitName; //command to execute (make unit)
			console.log(command);
			exec(command, {cwd: dirPath}, async (err, stdout, stderr) => { // execute command at workspace directory
				if (err) {
					vscode.window.showErrorMessage(stderr);
					if(settings.getAutoRemove()) {
						removeGeneratedFiles(filePath);
					}
					return;
				} else {
					vscode.window.showInformationMessage(unitName + ' made successfully without errors');
					const settings = new Settings(vscode)
					const userOptions = settings.getSettingsString(settings.TaskEnum.run) //get user specific settings
					const autoGHW = settings.getAutoGHW();
					const autoGTKWave = settings.getAutoGTKWave();
					//const dirPath = vscode.workspace.rootPath;
					const dirPath = filePath.substring(0, filePath.lastIndexOf("\\"));  
					const fileName = path.basename(filePath);
					output.show();
					if (!autoGHW) {
						vscode.window.showSaveDialog(ghwDialogOptions).then(fileInfos => {
							const simFilePath = fileInfos.fsPath;
							const command = 'ghdl -r ' + userOptions + ' ' + unitName + ' ' + '--wave=' + '"' + simFilePath + '"'; //command to execute (run unit)
							console.log(command);
							output.appendLine(command);
							exec(command, {cwd: dirPath}, async (err, stdout, stderr) => { // execute command at workspace directory
								output.append(stderr);
								if (err) {
									vscode.window.showErrorMessage(stderr);
									if(settings.getAutoRemove()) {
										removeGeneratedFiles(filePath);
									}
									return;
								} else {
									vscode.window.showInformationMessage(unitName + ' elaborated successfully without errors');
									if (autoGTKWave) {
										invokeGTKWave(simFilePath)
									}
									if(settings.getAutoRemove()) {
										removeGeneratedFiles(filePath);
									}
								}
							});
						});
					} else {
						const simFilePath = unitName+".ghw";
						const command = 'ghdl -r ' + userOptions + ' ' + unitName + ' ' + '--wave=' + '"' + simFilePath + '"'; //command to execute (run unit)
						console.log(command);
						output.appendLine(command);
						exec(command, {cwd: dirPath}, async (err, stdout, stderr) => { // execute command at workspace directory
							output.append(stderr);
							if (err) {
								vscode.window.showErrorMessage(stderr);
								if(settings.getAutoRemove()) {
									removeGeneratedFiles(filePath);
								}
								return;
							} else {
								vscode.window.showInformationMessage(unitName + ' elaborated successfully without errors');
								if (autoGTKWave) {
									invokeGTKWave(dirPath+"\\"+simFilePath)
								}
								if(settings.getAutoRemove()) {
									removeGeneratedFiles(filePath);
								}
							}
						});
					}
				}
			});
		}
	});
}

/*
**Function: cleanGeneratedFiles
**usage: removes generated object files 
**parameter: path of one file in folder to be cleaned
**return value(s): none
 */
/**
 * @param {string} filePath
 */
function cleanGeneratedFiles(filePath) {
	//const dirPath = vscode.workspace.rootPath;
	const dirPath = filePath.substring(0, filePath.lastIndexOf("\\"));  
	const command = 'ghdl --clean'; //command to execute (clean generated files)
	console.log(command);
	exec(command, {cwd: dirPath}, async (err, stdout, stderr) => { // execute command at workspace directory
  		if (err) {
			vscode.window.showErrorMessage(stderr);
    		return;
  		} else {
			vscode.window.showInformationMessage('Successfully cleaned generated files');
		}
	});
}

/*
**Function: removeGeneratedFiles
**usage: removes generated object files and library file
**parameter: path of one file in folder to be cleansed
**return value(s): none
 */
/**
 * @param {string} filePath
 */
function removeGeneratedFiles(filePath) {
	//const dirPath = vscode.workspace.rootPath;
	const dirPath = filePath.substring(0, filePath.lastIndexOf("\\"));  
	const command = 'ghdl --remove'; //command to execute (remove generated files)
	console.log(command);
	exec(command, {cwd: dirPath}, async (err, stdout, stderr) => { // execute command at workspace directory
  		if (err) {
			vscode.window.showErrorMessage(stderr);
    		return;
  		} else {
			vscode.window.showInformationMessage('Successfully removed generated files');
		}
	});
}

/*
**Function: invokeGTKWave
**usage: opens selected file in GTKWave 
**parameter: filePath
**return value(s): none
 */
/**
 * @param {string} filePath
 */
function invokeGTKWave(filePath) {
	const command = 'gtkwave ' + '"' + filePath + '"'; //command to execute (gtkwave)
	console.log(command);
	exec(command, async (err, stdout, stderr) => { 
  		if (err) {
			vscode.window.showErrorMessage(stderr);
    		return;
  		}
	});
}

/*
**Function: showErrors
**usage: shows the errors reported by ghdl in the vscode editor 
**parameter: err (the error message)
**return value(s): none
*/
/**
 * @param {import("child_process").ExecException} err
 */
function showErrors(err) {
	let errStr; // the string containing the error message
	let errorList = new LinkedList(); // linked list containing error highlighting data
	
	console.log(err);

	errStr = err.toString(); 
	errStr = errStr.split(/\r?\n/); // splits the error by new line 
	
	setErrorList(errStr, errorList); // sets the linked list containing error information
	decorateErrors(errorList); 
}

/*
**Function: setErrorList
**usage: analyzes the error string and sets the error data in it, according to the error message
**parameter: errStr (string conatining the error message), errorList(the error list)
**return value(s): errorList
*/
/**
 * @param {any[]} errStr
 * @param {import("../src/util/linkedlist/LinkedList")} errorList
 */
function setErrorList(errStr, errorList) {
	let errHints = []; // all error hits in the error message
	const regExHints = /[0-9]+[:]{1}[0-9]+[:]{1}[^]*/g; 

	// extracts everything after the file path in every line of the error message
	errStr.forEach(function(errStr) { 
		let match; 
		while(match = regExHints.exec(errStr)) {
			errHints.push(match[0]); 
		}
	});
	
	errHints.forEach(function(errHint){ // loop over all errors found
		const bufPos = errHint.match(/(\d+)/g); // position of error in source code 
		const bufMsg = errHint.match(/\s[^]+/g); // message of specific error
		let bufKeywrds = [];
		
		const keySQM = errHint.match(/'(.*?)'/g); //keywords single quitation marks
		const keyDQM = errHint.match(/"(.*?)"/g); //keywords double quotation marks
		if(keyDQM != null) { // delete double quotation marks of message
			keyDQM.forEach(function(keywrd) {
				bufKeywrds.push(keywrd.replace(/"/g, '')); 
			});
		} 
		if(keySQM != null) {
			keySQM.forEach(function(keywrd) { // delete single quotation marks of message
				bufKeywrds.push(keywrd.replace(/'/g, ''));
			});
		}
		 
		if(bufPos.length >= 2) { // append error information at linked list (length must be greater than or equal if more numbers get detected mistakenly)
			let data = new ErrorData(bufPos[0] , bufPos[1], bufMsg[0], bufKeywrds); 
			errorList.append(data); 
		}
	});
	return errorList; 
}

/*
**Function: decorateErrors
**usage: sets the decoration information for vscode, according to the error list and passes them to vscode
**parameter: errorList
**return value(s): none
*/
/**
 * @param {import("../src/util/linkedlist/LinkedList")} errorList
 */
function decorateErrors(errorList) {
	let activeEditor = vscode.window.activeTextEditor; // active text editor 
	const text = activeEditor.document.getText().toLocaleLowerCase(); // active text in editor (lower case since ghdl error output sets all chars to lowercase)

	if (!activeEditor) { // dont do error highlighting if no editor is open 
		return;
	}

	let smallNumbers = []; // contains decoration objects of errors with less than 3 characters
	let largeNumbers = []; // contains decoration objects of errors with more or equal to 3 characters
	let wholeLine = []; // contains decoration objects of errors with no characters (whole line will be highlighted)
	for(let listElement = 0; listElement < errorList.getLength(); listElement++) {
		const currElement = errorList.getElement(listElement); // current errorList element
		const currLine = currElement.getLine() - 1; //subtracted by 1 since vs code is 0 indexed and ghdl starts lines at 1
		const currMessage = currElement.getMessage(); // message of current error
		const keywrdsArr = errorList.getElement(listElement).getKeywords(); //check if errorList has keywords error

		if(keywrdsArr.length === 0) {
			const line = activeEditor.document.lineAt(currLine); 
			const decorationRange = new vscode.Range(line.range.start, line.range.end); // decorate line from start to end of text
			const wholeLineDecoration = { range: decorationRange, hoverMessage: currMessage};
			wholeLine.push(wholeLineDecoration); // set decoration for whole line
		}
		for(let i = 0; i < keywrdsArr.length; i++) { // iterate over all keywords in array
			const regEx = new RegExp(keywrdsArr[i], 'g'); // regex containing current keyword
			let match;
			while (match = regEx.exec(text)) { // look for matches of keyword in active window
				const startPos = activeEditor.document.positionAt(match.index); // start position of match 
				const endPos = activeEditor.document.positionAt(match.index + match[0].length); // end position of match 
				if(startPos.line === currLine) { // check if line of keyword and match are equal
					const decoration = { range: new vscode.Range(startPos, endPos), hoverMessage: currMessage};
					if (match[0].length < 3) {
						smallNumbers.push(decoration);
					} else {
						largeNumbers.push(decoration);
					}
				}
			}
		}
	}
	// set decorations with specified css style 
	activeEditor.setDecorations(smallDecorationType, smallNumbers);
	activeEditor.setDecorations(largeDecorationType, largeNumbers);
	activeEditor.setDecorations(lineDecorationType, wholeLine);
}

/*
**Function: removeDecrations
**usage: removes all decorations from editor 
**parameter: none
**return value(s): none
*/
function removeDecorations(){
	vscode.window.activeTextEditor.setDecorations(lineDecorationType, []);
	vscode.window.activeTextEditor.setDecorations(largeDecorationType, []);
	vscode.window.activeTextEditor.setDecorations(smallDecorationType, []);
}
