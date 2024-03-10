import { Lexeme } from "../lexical/lexeme";

export class CRLSyntaxError extends Error {
	/**
	 * Lexema em processamento no momento do erro
	 */
	public lexeme: Lexeme;

	/**
	 * Número da linha em que o erro ocorreu
	 */
	public line: number;

	/**
	 * Número da coluna em que o erro ocorreu
	 */
	public column: number;

	/**
	 * Erro na sintática do comando
	 * @param message Descrição do erro
	 * @param lexeme Lexema em processamento no momento do erro
	 * @param line Número da linha em que o erro ocorreu
	 * @param column Número da coluna em que o erro ocorreu
	 */
	constructor (message: string, lexeme: Lexeme, line: number, column: number) {
		super(message);
		this.lexeme = lexeme;
		this.line = line;
		this.column = column;
	}
}
