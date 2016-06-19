'use strict';

import {
	Disposable,
	ExtensionContext,
} from 'vscode';

import {
	LanguageClient,
 	LanguageClientOptions,
	Executable
} from 'vscode-languageclient';

export function activate(ctx: ExtensionContext) {
	let serverExecutable: Executable = {
		command: 'lein',
		args: ['run'],
		options: {
			cwd: ctx.asAbsolutePath('server'),
		}
	};

	let clientOptions: LanguageClientOptions = {
		documentSelector: ['clojure'],
	}

	let disposable = new LanguageClient('Clojure Server', serverExecutable, clientOptions).start();

	ctx.subscriptions.push(disposable);
}
