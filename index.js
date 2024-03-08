const Automata = require("./automata/automata");

const LexicalAnalysis = require("./lexical/lexical-analysis");

const CRLSyntaxError = require("./syntactic/syntax-error");
const SyntacticAnalysis = require("./syntactic/syntactic-analysis");

/**
 * Valida o código CRL de definição e estruturação de um comando, retornando um erro sintático caso o código seja inválido.
 * @param {string} cmd Código usando a linguagem CRL de definição e estruturação de um comando
 * @returns {CRLSyntaxError | null}
 */
function validateSyntax (cmd) {
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

module.exports = { Automata, validateSyntax };
