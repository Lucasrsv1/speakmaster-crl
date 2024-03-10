import { AutomataState, AutomataStateType } from "./automata/automata-state";

import { LexicalAnalysis } from "./lexical/lexical-analysis";
import { TokenType } from "./lexical/token-type";

import { SyntacticAnalysis } from "./syntactic/syntactic-analysis";

/**
 * Interpretador da linguagem de definição de autômatos de comandos
 */
class Interpreter {
	/**
	 * Flag de depuração do interpretador
	 */
	public debugging: boolean;

	/**
	 * Flag de depuração do analisador léxico
	 */
	public lexicalDebugging: boolean;

	/**
	 * Flag de depuração do analisador sintático
	 */
	public syntacticDebugging: boolean;

	constructor () {
		this.debugging = false;
		this.syntacticDebugging = false;
		this.lexicalDebugging = false;
	}

	/**
	 * Gera os estados de um autômato a partir da string de definição dele
	 * @param cmd String de definição e estruturação de um comando
	 */
	public getAutomataStates (cmd: string): AutomataState[] {
		const lexicalAnalysis = new LexicalAnalysis(cmd, this.lexicalDebugging);
		const syntacticAnalysis = new SyntacticAnalysis(lexicalAnalysis, this.syntacticDebugging);

		const states = syntacticAnalysis.analyze();
		this._setInitialStates(states);
		this._setFinalStates(states);

		if (this.debugging) {
			console.log("[Interpreter Log] Final list of states:");
			console.dir(states, { depth: Infinity });
		}

		return states;
	}

	/**
	 * Testa o analisador léxico
	 * @param cmd String de definição e estruturação de um comando
	 */
	public testLexicalAnalysis (cmd: string): void {
		let currentLexeme;
		const lexicalAnalysis = new LexicalAnalysis(cmd, true);

		do {
			currentLexeme = lexicalAnalysis.nextToken();
		} while (currentLexeme.type !== TokenType.END);
	}

	/**
	 * Identifica e marca como inicial os devidos estados do autômato
	 * @param states Estados do autômato
	 */
	private _setInitialStates (states: AutomataState[]): void {
		for (const state of states) {
			if (this.debugging)
				console.log("[Interpreter Log] Looking for inicial states, now processing:", state.id);

			switch (state.type) {
				case AutomataStateType.LIST:
					for (const item of state.innerStates)
						this._setInitialStates(item.innerStates);

					// Nenhum outro estado deve ser marcado como inicial
					return;
				case AutomataStateType.VARIABLE:
					// Se a variável tiver uma lista de opções,
					// percorre a lista atrás dos estados iniciais
					if (state.innerStates.length)
						this._setInitialStates(state.innerStates);
					else
						state.isInitial = true;

					// Nenhum outro estado deve ser marcado como inicial
					return;
				case AutomataStateType.OPTIONAL:
					// Outros estados podem ser marcados como iniciais, pois este era opcional
					this._setInitialStates(state.innerStates);
					break;
				default:
					// Nenhum outro estado deve ser marcado como inicial
					state.isInitial = true;
					return;
			}
		}
	}

	/**
	 * Identifica e marca como final os devidos estados do autômato
	 * @param states Estados do autômato
	 */
	private _setFinalStates (states: AutomataState[]): void {
		for (let i = states.length - 1; i >= 0; i--) {
			const state = states[i];
			if (this.debugging)
				console.log("[Interpreter Log] Looking for final states, now processing:", state.id);

			switch (state.type) {
				case AutomataStateType.LIST:
					for (let i = state.innerStates.length - 1; i >= 0; i--) {
						const item = state.innerStates[i];
						this._setFinalStates(item.innerStates);
					}

					// Nenhum outro estado deve ser marcado como final
					return;
				case AutomataStateType.VARIABLE:
					// Se a variável tiver uma lista de opções,
					// percorre a lista atrás dos estados finais
					if (state.innerStates.length)
						this._setFinalStates(state.innerStates);
					else
						state.isFinal = true;

					// Nenhum outro estado deve ser marcado como inicial
					return;
				case AutomataStateType.OPTIONAL:
					// Outros estados podem ser marcados como iniciais, pois este era opcional
					this._setFinalStates(state.innerStates);
					break;
				default:
					// Nenhum outro estado deve ser marcado como final
					state.isFinal = true;
					return;
			}
		}
	}
}

export default new Interpreter();
