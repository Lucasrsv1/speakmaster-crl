import { TokenType } from "./token-type";

/**
 * Menor unidade reconhecida pela linguagem
 */
export class Lexeme {
	/**
	 * Conteúdo do lexema
	 */
	public token: string;

	/**
	 * Tipo de token do lexema
	 */
	public type: TokenType;

	constructor (token: string, type: TokenType) {
		this.token = token;
		this.type = type;
	}
}
