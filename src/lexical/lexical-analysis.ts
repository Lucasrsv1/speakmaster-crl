import { Lexeme } from "./lexeme";
import symbolTable from "./symbol-table";
import { TokenType } from "./token-type";

/**
 * Realiza a análise léxica de um comando definido pela
 * linguagem de definição de autômatos de comandos
 */
export class LexicalAnalysis {
	/**
	 * Conteúdo ainda não processado
	 */
	public input: string[];

	/**
	 * Flag de depuração
	 */
	public debugging: boolean;

	/**
	 * Posição atual do cursor para o token atual
	 */
	private _position: number;

	/**
	 * Linha onde começa o token atual
	 */
	private _line: number;

	/**
	 * Linha atual do cursor na leitura da entrada
	 */
	private _nextLine: number;

	/**
	 * Posição atual do cursor para onde começa o token atual na linha atual
	 */
	private _column: number;

	/**
	 * Posição atual do cursor na leitura da entrada
	 */
	private _nextColumn: number;

	/**
	 * Tamanho do último token processado para atualização da posição
	 */
	private _lastTokenSize: number;

	/**
	 * @param input String de definição e estruturação de um comando
	 * @param debugging Flag de depuração
	 */
	constructor (input: string, debugging: boolean = false) {
		this.input = input.split("");
		this.debugging = debugging;
		this._position = 1;
		this._line = 1;
		this._column = 1;
		this._nextLine = 1;
		this._nextColumn = 1;
		this._lastTokenSize = 0;
	}

	/**
	 * Obtém a posição do cursor para onde começa o token atual no input
	 */
	public getPosition (): number {
		return this._position;
	}

	/**
	 * Obtém a linha onde começa o token atual no input
	 */
	public getLine (): number {
		return this._line;
	}

	/**
	 * Obtém a posição do cursor para onde começa o token atual na linha atual do input
	 */
	public getColumn (): number {
		return this._column;
	}

	/**
	 * Obtém o próximo lexema da definição de comando sendo analisada
	 */
	public nextToken (): Lexeme {
		this._position += this._lastTokenSize;
		this._line = this._nextLine;
		this._column = this._nextColumn;
		this._lastTokenSize = 0;

		const lex = new Lexeme("", TokenType.END);
		let state = 1;

		while (![2, 4].includes(state)) {
			const c = this.input.shift();
			if (c !== undefined)
				this._lastTokenSize++;

			switch (state) {
				case 1:
					if (c === undefined) {
						state = 4;
					} else if ([" ", "\n", "\t", "\r"].includes(c)) {
						if (c === "\n") {
							this._nextLine++;
							this._nextColumn = 1;
						} else {
							this._nextColumn++;
						}

						this._position += this._lastTokenSize;
						this._line = this._nextLine;
						this._column = this._nextColumn;
						this._lastTokenSize = 0;
						state = 1;
					} else if ([",", "(", ")", "[", "]", "{", "}"].includes(c)) {
						this._nextColumn++;
						lex.token += c;
						state = 2;
					} else {
						this._nextColumn++;
						lex.token += c;
						lex.type = TokenType.STRING;
						state = 3;
					}
					break;
				case 3:
					if (c === undefined || c === " " || c === "\n") {
						if (c === "\n") {
							this._nextLine++;
							this._nextColumn = 1;
						} else if (c !== undefined) {
							this._nextColumn++;
						}

						state = 4;
					} else if ([",", "(", ")", "[", "]", "{", "}"].includes(c)) {
						this.input.unshift(c);
						this._lastTokenSize--;
						state = 4;
					} else {
						this._nextColumn++;
						lex.token += c;
					}
					break;
				default:
					throw Error("Unreachable");
			}
		}

		if (state === 2)
			lex.type = symbolTable.find(lex.token);

		if (this.debugging)
			console.log(`[Lexical Analysis Log] Found token "${lex.token}" of type ${lex.type} at position ${this.getPosition()}`);

		return lex;
	}
}
