// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const { writeFile } = require('fs');
const vscode = require('vscode');
const axios = require('axios');


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	console.log("✨ Hi! I'm HAKUSHIKI!");
	vscode.window.showInformationMessage("✨ Hi! I'm HAKUSHIKI!");

	let activeEditor = vscode.window.activeTextEditor;
	let document = activeEditor.document;

	//アクティブドキュメントに少しでも更新があれば実行される
	let disposable = vscode.workspace.onDidChangeTextDocument(event => {
		if (event.document === document) {
			//変更された文字列を取得
			let contentChanges = event.contentChanges[0]
			let contentChangesText = contentChanges.text;
			//改行された後のみ実行
			if (contentChangesText.match(/\n\s*/) || contentChangesText.match(/\r\n\s*/)) {
				if (!(contentChangesText.includes('🤔 HAKUSHIKI が考え中です'))) {
					//変更された行番号と、行全体の文字列を取得
					let lineNumber = contentChanges.range.start.line;
					console.log("変更された行番号は" + lineNumber);
					let lineText = activeEditor.document.lineAt(lineNumber).text;
					console.log("変更された行全体の文字列は" + lineText);
					execHAKUSHIKI(lineText);
				}
			}
		}
	});

	async function execHAKUSHIKI(lineText) {
		if (lineText.includes('\/\/ @HAKUSHIKI:')) {
			await output(lineText);
		} else if (lineText.includes('\/\/@HAKUSHIKI:')) {
			await output(lineText);
		}
	}

	// ユーザーが入力したコメントの最初の文字がどのくらいインデックスを取ってるか計算する
	async function calcSpace(lineText) {
		const commentStart = lineText.indexOf("/");
		let space = "";
		for (let index = 0; index < commentStart; index++) {
			space = space + " "
		}
		return space;
	}

	//引数に入れた文字列を挿入
	function appendTextToActiveEditor(text) {
		// アクティブなエディタがない場合は終了
		if (!activeEditor) {
			return;
		}
		// エディタのドキュメントを取得
		const document = activeEditor.document;
		// カーソル位置を取得
		const position = activeEditor.selection.active;
		// テキストを挿入
		activeEditor.edit(editBuilder => {
			editBuilder.insert(position, text);
		});
	}

	async function output(lineText) {
		const space = await calcSpace(lineText);
		const thing = lineText.replace('\/\/ @HAKUSHIKI:', '');
		appendTextToActiveEditor('\r\n' + space + "\/\/ 🤔 HAKUSHIKI が考え中です");
		let result = await think(thing + "をJavaScriptでコメント以外では自然言語は使わずに書いてください。", space);
		if(result === "error"){
			appendTextToActiveEditor('\r\n' + space + "内部の処理に失敗しました。");
		}else {
			appendTextToActiveEditor(result + '\r\n' + space + "\/\/ 😆 Coding by HAKUSHIKI");
		}
	}

	async function think(thing, space) {
		let reuslt;
		await axios.post('https://faz6cdpz0a.execute-api.ap-northeast-1.amazonaws.com/main', {
			"question": thing
		})
			//成功した時の処理
			.then(function (response) {
				result = response.data.body;
				result = result.slice(1, -1);
				result = result.replace(/\\n/g, "\r\n" + space);
				result = result.trim();
			})
			//失敗した時の処理
			.catch(function (error) {
				console.log(error);
				reuslt = "error";
			});

		return result;
	}

	context.subscriptions.push(disposable);

}

// This method is called when your extension is deactivated
function deactivate() {
	console.log('👋 Bye from HAKUSHIKI');
	vscode.window.showInformationMessage("👋 Bye from HAKUSHIKI");
}

module.exports = {
	activate,
	deactivate
}
