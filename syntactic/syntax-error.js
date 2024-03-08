class CRLSyntaxError extends Error {
	/**
	 * Erro na sintática do comando
	 * @param {string} message Descrição do erro
	 * @param {import("../lexical/lexeme")} lexeme Lexema em processamento no momento do erro
	 * @param {number} line Número da linha em que o erro ocorreu
	 * @param {number} column Número da coluna em que o erro ocorreu
	 */
	constructor (message, lexeme, line, column) {
		super(message);
		this.lexeme = lexeme;
		this.line = line;
		this.column = column;
	}
}

module.exports = CRLSyntaxError;
