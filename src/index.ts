import { LexicalAnalysis } from "./lexical/lexical-analysis";

import { CRLSyntaxError } from "./syntactic/syntax-error";
import { SyntacticAnalysis } from "./syntactic/syntactic-analysis";

import interpreter from "./interpreter";

export { Automata } from "./automata/automata";

/**
 * Configura o modo de depuração do interpretador da linguagem CRL
 * @param debugging Ativa o modo de depuração do interpretador na análise dos estados do automato
 * @param lexicalDebugging Ativa o modo de depuração do analisador léxico
 * @param syntacticDebugging Ativa o modo de depuração do analisador sintático
 */
export function setInterpreterDebug (debugging: boolean, lexicalDebugging: boolean = debugging, syntacticDebugging: boolean = debugging): void {
	interpreter.debugging = debugging;
	interpreter.lexicalDebugging = lexicalDebugging;
	interpreter.syntacticDebugging = syntacticDebugging;
}

/**
 * Valida o código CRL de definição e estruturação de um comando, retornando um erro sintático caso o código seja inválido.
 * @param cmd Código usando a linguagem CRL de definição e estruturação de um comando
 */
export function validateSyntax (cmd: string): CRLSyntaxError | null {
	const lexicalAnalysis = new LexicalAnalysis(cmd);
	const syntacticAnalysis = new SyntacticAnalysis(lexicalAnalysis);

	try {
		syntacticAnalysis.analyze();
		return null;
	} catch (error) {
		if (error instanceof CRLSyntaxError) {
			return error;
		} else {
			throw error;
		}
	}
}
