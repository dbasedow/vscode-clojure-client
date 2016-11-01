'use strict';

import {
	CancellationToken,
	Disposable,
	ExtensionContext,
	RequestType,
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

class JarContent {
	content: string;
	constructor(s: string) {
		this.content = s;
	}
}

function asJarContent(value: JarContent) {
	return new JarContent(value.content);
}

class JarContentRequestType implements RequestType<void, void, void> {
	public method = 'custom/getJarContent';
}

function toUriString(uri: Uri) {
	return uri.toString(true);
}

class JarTextDocumentContentProvider implements TextDocumentContentProvider {
	_client: LanguageClient;

	constructor(client: LanguageClient) {
		this._client = client;
	}

	private requestContent(uri: Uri, token: CancellationToken) {
		return this._client.sendRequest(new JarContentRequestType(), {uri: toUriString(uri)}, token)
			.then(asJarContent, function (error) { return Promise.resolve(null); });
	}

	public provideTextDocumentContent(uri: Uri, token: CancellationToken) {
		return this.requestContent(uri, token).then(function(value: JarContent) {
			return value.content;
		});
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

	let client =  new LanguageClient('Clojure Server', serverExecutable, clientOptions);

	let disposable = client.start();

	ctx.subscriptions.push(disposable);

	workspace.registerTextDocumentContentProvider('jar', new JarTextDocumentContentProvider(client));
}
