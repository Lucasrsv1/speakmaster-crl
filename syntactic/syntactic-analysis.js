const AutomataState = require("../automata/automata-state");
const { AutomataStateType } = require("../automata/automata-state");

const Lexeme = require("../lexical/lexeme");
const LexicalAnalysis = require("../lexical/lexical-analysis");
const TokenType = require("../lexical/token-type");

const CRLSyntaxError = require("./syntax-error");

/**
 * Realiza a análise sintática de um comando definido pela
 * linguagem de definição de autômatos de comandos
 */
class SyntacticAnalysis {
	/**
	 * Flag de depuração
	 * @type {boolean}
	 */
	debugging;

	/**
	 * Analisador lexical para processamento léxico da linguagem
	 * @type {LexicalAnalysis}
	 */
	_lexicalAnalysis;

	/**
	 * Lexema atual sendo processado sintaticamente
	 * @type {Lexeme}
	 */
	_currentLexeme;

	/**
	 * @param {string} lexicalAnalysis Analisador léxico carregado com o definição de um comando
	 * @param {boolean} debugging Flag de depuração
	 */
	constructor (lexicalAnalysis, debugging) {
		this.debugging = debugging;

		this._lexicalAnalysis = lexicalAnalysis;
		this._currentLexeme = this._lexicalAnalysis.nextToken();
	}

	/**
	 * Consome um lexema de certo tipo
	 * @param {TokenType} type Tipo de token esperado
	 */
	_eat (type) {
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
	_advance () {
		if (this.debugging)
			console.log(`[Syntactic Analysis Log] Advanced ("${this._currentLexeme.token}", ${this._currentLexeme.type})`);

		this._currentLexeme = this._lexicalAnalysis.nextToken();
	}

	/**
	 * Inicia a análise sintática do comando
	 */
	analyze () {
		return this._processSentence();
	}

	/**
	 * Processa o elemento `<sentence>` da gramática
	 * @param {AutomataState[]} automataStates Lista de estados do autômato resultante do processamento dos lexemas
	 * @returns {AutomataState[]}
	 */
	_processSentence (automataStates = []) {
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
	 * @param {boolean} isFirstElement Identifica se está processando o primeiro elemento do conjunto <optional>
	 * @returns {AutomataState[]}
	 */
	_processOptional (isFirstElement = true) {
		// Definição na gramática:
		// <optional> ::= <optional> <optional>
		//                <term>
		//                '[' <optional> ']'
		//                '(' <list> ')'
		//                '{' <variable> '}'

		const automataStates = [];

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

		while (this._currentLexeme.type !== TokenType.CLOSE_BRACKETS)
			automataStates.push(...this._processOptional(false));

		if (!isFirstElement)
			return automataStates;

		return [
			AutomataState.create("", AutomataStateType.OPTIONAL, automataStates)
		];
	}

	/**
	 * Processa o elemento `<list>` da gramática
	 * @returns {AutomataState}
	 */
	_processList () {
		// Definição na gramática:
		// <list>     ::= <item>
		//                <item> ',' <list>

		const possibleStates = [this._processItem()];
		while (this._currentLexeme.type === TokenType.COMMA) {
			this._eat(TokenType.COMMA);
			possibleStates.push(this._processItem());
		}

		return AutomataState.create("", AutomataStateType.LIST, possibleStates);
	}

	/**
	 * Processa o elemento `<item>` da gramática
	 * @returns {AutomataState}
	 */
	_processItem () {
		// Definição na gramática:
		// <item>     ::= <item> <item>
		//                <term>
		//                '[' <optional> ']'
		//                '(' <list> ')'
		//                '{' <variable> '}'

		const automataStates = [];
		do {
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
		} while (
			this._currentLexeme.type !== TokenType.COMMA &&
			this._currentLexeme.type !== TokenType.CLOSE_PARENTHESIS
		);

		return AutomataState.create("", AutomataStateType.ITEM, automataStates);
	}

	/**
	 * Processa o elemento `<term>` da gramática
	 * @returns {AutomataState}
	 */
	_processVariable () {
		// Definição na gramática:
		// <variable> ::= <string> { <string> } ['(' <list> ')']

		let variableName = [this._currentLexeme.token];
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
	 * @returns {AutomataState}
	 */
	_processTerm () {
		// Definição na gramática:
		// <term>     ::= <string>

		const automataState = AutomataState.create(this._currentLexeme.token, AutomataStateType.TERM);
		this._eat(TokenType.STRING);
		return automataState;
	}
}

module.exports = SyntacticAnalysis;
