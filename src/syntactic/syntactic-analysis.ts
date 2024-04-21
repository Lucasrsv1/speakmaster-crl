import { AutomataState, AutomataStateType } from "../automata/automata-state";

import { Lexeme } from "../lexical/lexeme";
import { LexicalAnalysis } from "../lexical/lexical-analysis";
import { TokenType } from "../lexical/token-type";

import { CRLSyntaxError } from "./syntax-error";

/**
 * Realiza a análise sintática de um comando definido pela
 * linguagem de definição de autômatos de comandos
 */
export class SyntacticAnalysis {
	/**
	 * Flag de depuração
	 */
	public debugging: boolean;

	/**
	 * Analisador lexical para processamento léxico da linguagem
	 */
	private _lexicalAnalysis: LexicalAnalysis;

	/**
	 * Lexema atual sendo processado sintaticamente
	 */
	private _currentLexeme: Lexeme;

	/**
	 * @param lexicalAnalysis Analisador léxico carregado com o definição de um comando
	 * @param debugging Flag de depuração
	 */
	constructor (lexicalAnalysis: LexicalAnalysis, debugging: boolean = false) {
		this.debugging = debugging;

		this._lexicalAnalysis = lexicalAnalysis;
		this._currentLexeme = this._lexicalAnalysis.nextToken();
	}

	/**
	 * Consome um lexema de certo tipo
	 * @param type Tipo de token esperado
	 */
	private _eat (type: TokenType): void {
		if (this.debugging)
			console.log(`[Syntactic Analysis Log] Expected ${type}, found token "${this._currentLexeme.token}" of type ${this._currentLexeme.type}`);

		if (type === this._currentLexeme.type)
			this._advance();
		else if (this._currentLexeme.type === TokenType.END)
			throw new CRLSyntaxError("Unexpected end of command", this._currentLexeme, this._lexicalAnalysis.getLine(), this._lexicalAnalysis.getColumn());
		else
			throw new CRLSyntaxError(`Unexpected lexeme "${this._currentLexeme.token}" at ${this._lexicalAnalysis.getPosition()}`, this._currentLexeme, this._lexicalAnalysis.getLine(), this._lexicalAnalysis.getColumn());
	}

	/**
	 * Carrega o próximo lexema
	 */
	private _advance (): void {
		if (this.debugging)
			console.log(`[Syntactic Analysis Log] Advanced ("${this._currentLexeme.token}", ${this._currentLexeme.type})`);

		this._currentLexeme = this._lexicalAnalysis.nextToken();
	}

	/**
	 * Inicia a análise sintática do comando
	 */
	public analyze (): AutomataState[] {
		return this._processSentence();
	}

	/**
	 * Processa o elemento `<sentence>` da gramática
	 * @param automataStates Lista de estados do autômato resultante do processamento dos lexemas
	 */
	private _processSentence (automataStates: AutomataState[] = []): AutomataState[] {
		// Definição na gramática:
		// <sentence> ::= <sentence> <sentence>
		//                <term>
		//                '[' <optional> ']'
		//                '(' <list> ')'
		//                '{' <variable> '}'

		if (this._currentLexeme.type === TokenType.OPEN_BRACKETS) {
			this._eat(TokenType.OPEN_BRACKETS);
			automataStates.push(...this._processOptional());
			this._eat(TokenType.CLOSE_BRACKETS);
		} else if (this._currentLexeme.type === TokenType.OPEN_PARENTHESIS) {
			this._eat(TokenType.OPEN_PARENTHESIS);
			automataStates.push(this._processList());
			this._eat(TokenType.CLOSE_PARENTHESIS);
		} else if (this._currentLexeme.type === TokenType.OPEN_CURLY_BRACKETS) {
			this._eat(TokenType.OPEN_CURLY_BRACKETS);
			automataStates.push(this._processVariable());
			this._eat(TokenType.CLOSE_CURLY_BRACKETS);
		} else {
			automataStates.push(this._processTerm());
		}

		if (this._currentLexeme.type !== TokenType.END)
			this._processSentence(automataStates);

		return automataStates;
	}

	/**
	 * Processa o elemento `<optional>` da gramática
	 * @param isFirstElement Identifica se está processando o primeiro elemento do conjunto <optional>
	 */
	private _processOptional (isFirstElement: boolean = true): AutomataState[] {
		// Definição na gramática:
		// <optional> ::= <optional> <optional>
		//                <term>
		//                '[' <optional> ']'
		//                '(' <list> ')'
		//                '{' <variable> '}'

		let innerState: AutomataState;
		const automataStates = [];
		const stringRepresentation: string[] = [];

		switch (this._currentLexeme.type) {
			case TokenType.OPEN_BRACKETS:
				this._eat(TokenType.OPEN_BRACKETS);

				innerState = this._processOptional()[0];
				automataStates.push(innerState);

				this._eat(TokenType.CLOSE_BRACKETS);
				stringRepresentation.push(innerState.value);
				break;
			case TokenType.OPEN_PARENTHESIS:
				this._eat(TokenType.OPEN_PARENTHESIS);

				innerState = this._processList();
				automataStates.push(innerState);

				this._eat(TokenType.CLOSE_PARENTHESIS);
				stringRepresentation.push(innerState.value);
				break;
			case TokenType.OPEN_CURLY_BRACKETS:
				this._eat(TokenType.OPEN_CURLY_BRACKETS);

				innerState = this._processVariable();
				automataStates.push(innerState);

				this._eat(TokenType.CLOSE_CURLY_BRACKETS);
				stringRepresentation.push(this._getCRLFromState(innerState));
				break;
			default:
				innerState = this._processTerm();
				automataStates.push(innerState);
				stringRepresentation.push(innerState.value);
				break;
		}

		while (this._currentLexeme.type !== TokenType.CLOSE_BRACKETS) {
			const innerAutomataStates = this._processOptional(false);
			automataStates.push(...innerAutomataStates);
			stringRepresentation.push(...innerAutomataStates.map(this._getCRLFromState));
		}

		if (!isFirstElement)
			return automataStates;

		return [
			AutomataState.create("[" + stringRepresentation.join(" ") + "]", AutomataStateType.OPTIONAL, automataStates)
		];
	}

	/**
	 * Processa o elemento `<list>` da gramática
	 */
	private _processList (): AutomataState {
		// Definição na gramática:
		// <list>     ::= <item>
		//                <item> ',' <list>

		let stringRepresentation: string = "";
		let item: AutomataState = this._processItem();

		const possibleStates = [item];
		stringRepresentation = item.value;

		while (this._currentLexeme.type === TokenType.COMMA) {
			this._eat(TokenType.COMMA);
			item = this._processItem();

			possibleStates.push(item);
			stringRepresentation += ", " + item.value;
		}

		return AutomataState.create("(" + stringRepresentation + ")", AutomataStateType.LIST, possibleStates);
	}

	/**
	 * Processa o elemento `<item>` da gramática
	 */
	private _processItem (): AutomataState {
		// Definição na gramática:
		// <item>     ::= <item> <item>
		//                <term>
		//                '[' <optional> ']'
		//                '(' <list> ')'
		//                '{' <variable> '}'

		let innerState: AutomataState;
		const automataStates = [];
		const stringRepresentation: string[] = [];

		do {
			switch (this._currentLexeme.type) {
				case TokenType.OPEN_BRACKETS:
					this._eat(TokenType.OPEN_BRACKETS);

					innerState = this._processOptional()[0];
					automataStates.push(innerState);

					this._eat(TokenType.CLOSE_BRACKETS);
					stringRepresentation.push(innerState.value);
					break;
				case TokenType.OPEN_PARENTHESIS:
					this._eat(TokenType.OPEN_PARENTHESIS);

					innerState = this._processList();
					automataStates.push(innerState);

					this._eat(TokenType.CLOSE_PARENTHESIS);
					stringRepresentation.push(innerState.value);
					break;
				case TokenType.OPEN_CURLY_BRACKETS:
					this._eat(TokenType.OPEN_CURLY_BRACKETS);

					innerState = this._processVariable();
					automataStates.push(innerState);

					this._eat(TokenType.CLOSE_CURLY_BRACKETS);
					stringRepresentation.push(this._getCRLFromState(innerState));
					break;
				default:
					innerState = this._processTerm();
					automataStates.push(innerState);
					stringRepresentation.push(innerState.value);
					break;
			}
		} while (
			this._currentLexeme.type !== TokenType.COMMA &&
			this._currentLexeme.type !== TokenType.CLOSE_PARENTHESIS
		);

		return AutomataState.create(stringRepresentation.join(" "), AutomataStateType.ITEM, automataStates);
	}

	/**
	 * Processa o elemento `<term>` da gramática
	 */
	private _processVariable (): AutomataState {
		// Definição na gramática:
		// <variable> ::= <string> { <string> } ['(' <list> ')']

		const variableName = [this._currentLexeme.token];
		this._eat(TokenType.STRING);

		while (this._currentLexeme.type === TokenType.STRING) {
			variableName.push(this._currentLexeme.token);
			this._eat(TokenType.STRING);
		}

		let internalList = null;
		if (this._currentLexeme.type === TokenType.OPEN_PARENTHESIS) {
			this._eat(TokenType.OPEN_PARENTHESIS);
			internalList = this._processList();
			this._eat(TokenType.CLOSE_PARENTHESIS);
		}

		return AutomataState.create(variableName.join(" "), AutomataStateType.VARIABLE, internalList ? [internalList] : []);
	}

	/**
	 * Processa o elemento `<term>` da gramática
	 */
	private _processTerm (): AutomataState {
		// Definição na gramática:
		// <term>     ::= <string>

		const automataState = AutomataState.create(this._currentLexeme.token, AutomataStateType.TERM);
		this._eat(TokenType.STRING);
		return automataState;
	}

	private _getCRLFromState (state: AutomataState): string {
		if (state.type !== AutomataStateType.VARIABLE)
			return state.value;

		// Se for uma variável restrita ela terá uma lista de restrições
		if (state.innerStates[0])
			return "{" + state.value + " " + state.innerStates[0].value + "}";

		return "{" + state.value + "}";
	}
}
