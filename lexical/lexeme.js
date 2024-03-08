const TokenType = require("./token-type");

/**
 * Menor unidade reconhecida pela linguagem
 */
class Lexeme {
	/**
	 * Conteúdo do lexema
	 * @type {string}
	 */
	token;

	/**
	 * Tipo de token do lexema
	 * @type {TokenType}
	 */
	type;

	constructor (token, type) {
		this.token = token;
		this.type = type;
	}
}

module.exports = Lexeme;
