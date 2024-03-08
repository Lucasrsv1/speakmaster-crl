/**
 * Tipos de tokens para classificação dos lexemas reconhecidos pela linguagem
 * @enum {string}
 */
const TokenType = Object.freeze({
	// SYMBOLS
	COMMA: "COMMA",									// ','
	OPEN_PARENTHESIS: "OPEN_PARENTHESIS",			// '('
	CLOSE_PARENTHESIS: "CLOSE_PARENTHESIS",			// ')'
	OPEN_BRACKETS: "OPEN_BRACKETS",					// '['
	CLOSE_BRACKETS: "CLOSE_BRACKETS",				// ']'
	OPEN_CURLY_BRACKETS: "OPEN_CURLY_BRACKETS",		// '{'
	CLOSE_CURLY_BRACKETS: "CLOSE_CURLY_BRACKETS",	// '}'

	// OTHERS
	END: "END",										// Fim do input
	STRING: "STRING"								// Conteúdo de uma string
});

module.exports = TokenType;
