import { TokenType } from "./token-type";

/**
 * Tabela que associa caracteres de símbolos aos tipos de token que eles representam
 */
class SymbolTable {
	/**
	 * Associa um caractere de símbolo ao tipo de token que ele representa
	 */
	private hashMap: Map<string, TokenType>;

	constructor () {
		this.hashMap = new Map();

		this.hashMap.set(",", TokenType.COMMA);
		this.hashMap.set("(", TokenType.OPEN_PARENTHESIS);
		this.hashMap.set(")", TokenType.CLOSE_PARENTHESIS);
		this.hashMap.set("[", TokenType.OPEN_BRACKETS);
		this.hashMap.set("]", TokenType.CLOSE_BRACKETS);
		this.hashMap.set("{", TokenType.OPEN_CURLY_BRACKETS);
		this.hashMap.set("}", TokenType.CLOSE_CURLY_BRACKETS);
	}

	/**
	 * Verifica se o lexema lido é um símbolo
	 * @param token Conteúdo do lexema lido
	 */
	public contains (token: string): boolean {
		return this.hashMap.has(token);
	}

	/**
	 * Retorna o tipo de token correspondente ao lexema lido
	 * @param token Conteúdo do lexema lido
	 */
	public find (token: string): TokenType {
		return this.contains(token) ? this.hashMap.get(token) as TokenType : TokenType.STRING;
	}
}

export default new SymbolTable();
