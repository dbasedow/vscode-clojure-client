'use strict';

import {
	CancellationToken,
	Disposable,
	ExtensionContext,
	TextDocumentContentProvider,
	Uri,
	window as Window,
	workspace
} from 'vscode';

import {
		Message
} from 'vscode-jsonrpc';

import {
	LanguageClient,
 	LanguageClientOptions,
	Executable,
	ErrorHandler,
	ErrorAction,
	CloseAction,
} from 'vscode-languageclient';

class ErrorLogger implements ErrorHandler {
	public error(error: Error, message: Message, count): ErrorAction {
		console.error(message, error);
		return ErrorAction.Shutdown;
	}
	public closed(): CloseAction {
		Window.showErrorMessage('The server crashed');
		return CloseAction.DoNotRestart;
	}
}

class JarTextDocumentContentProvider implements TextDocumentContentProvider {
	public provideTextDocumentContent(uri: Uri, token: CancellationToken) {
		return "";
	}
}

export function activate(ctx: ExtensionContext) {
	let serverExecutable: Executable = {
		command: 'lein',
		args: ['lein-vscode-server'],
		options: {
			cwd: workspace.rootPath
		}
	};

	let clientOptions: LanguageClientOptions = {
		documentSelector: ['clojure'],
		errorHandler: new ErrorLogger(),
	}

	let disposable = new LanguageClient('Clojure Server', serverExecutable, clientOptions).start();

	ctx.subscriptions.push(disposable);

	workspace.registerTextDocumentContentProvider('jar', new JarTextDocumentContentProvider());
}
