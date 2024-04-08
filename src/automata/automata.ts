// ? Um exemplo de montagem da tabela de transições do autômato se encontra no arquivo tests/manual-automata-validation.ts

import { AutomataState, AutomataStateType } from "./automata-state";

import interpreter from "../interpreter";
import { Match } from "./match";

/**
 * Representa o autômato executável de um comando
 */
export class Automata {
	/**
	 * Lista de estados do autômato
	 */
	private _states: AutomataState[] = [];

	/**
	 * Tabela de transição do autômato que associa um estado aos possíveis estados que podem vir após ele
	 */
	private _transitionTable: Map<symbol, AutomataState[]> = new Map();

	/**
	 * Associa a chave de um estado ao próprio estado
	 */
	private _statesMap: Map<symbol, AutomataState> = new Map();

	/**
	 * Inicializa cada variável que compõe o autômato
	 */
	private _defaultVariables: Record<string, string> = {};

	/**
	 * Associa a chave de um estado ao próprio estado
	 */
	private _statesToVariablesMap: Map<symbol, symbol[]> = new Map();

	/**
	 * Flag de depuração do autômato
	 */
	public static debugging: boolean = false;

	/**
	 * Define um autômato de um comando
	 * @param cmd String de definição e estruturação de um comando
	 */
	constructor (cmd: string) {
		// Obtém lista de estados a partir da string de definição do comando
		this._states = interpreter.getAutomataStates(cmd);
		this._initializeVariables();

		// Cria tabela de transição usando a ID dos estados como chave de mapeamento
		for (let i = 0; i < this._states.length; i++)
			this._createTransitions(this._states[i], this._states.slice(i + 1));

		if (Automata.debugging) {
			console.log("[Automata Log] Generated transition table:");
			for (const key of this._transitionTable.keys())
				console.log(`[Automata Log] ${this._statesMap.get(key)?.value} -> ${this._transitionTable.get(key)?.map(s => s.value).join(" | ")}`);
		}
	}

	/**
	 * Identifica todas as variáveis possíveis para o autômato e as inicializa com uma string vazia,
	 * além de montar o mapa que associa uma ID a um estado
	 */
	private _initializeVariables (): void {
		const queue = this._states.slice();
		let s = queue.shift();

		while (s) {
			this._statesMap.set(s.id, s);
			if (s.innerStates.length)
				queue.push(...s.innerStates);

			if (s.type === AutomataStateType.VARIABLE) {
				this._defaultVariables[s.value] = "";

				// Associa os itens da lista de opções à variável
				if (s.innerStates.length)
					this._mapToVariable(s.id, s.innerStates);
			}

			s = queue.shift();
		}
	}

	/**
	 * Associa estados termos às variáveis as quais eles estão relacionados
	 * @param variableID Identificador do estado que representa a variável
	 * @param states Lista com os estados que podem ocorrer para essa variável
	 */
	private _mapToVariable (variableID: symbol, states: AutomataState[]): void {
		for (const s of states) {
			if (s.innerStates.length)
				this._mapToVariable(variableID, s.innerStates);
			else if (s.type !== AutomataStateType.VARIABLE)
				this._statesToVariablesMap.set(s.id, (this._statesToVariablesMap.get(s.id) || []).concat([variableID]));
		}
	}

	/**
	 * Registra as transições possíveis para um estado
	 * @param state Estado chave que terá suas possíveis transições identificadas
	 * @param nextStates Lista com o restante dos estados que podem ocorrer após o estado chave
	 */
	private _createTransitions (state: AutomataState, nextStates: AutomataState[]): void {
		const possibleTransitions: AutomataState[] = [];

		switch (state.type) {
			case AutomataStateType.LIST:
				for (const item of state.innerStates) {
					for (let i = 0; i < item.innerStates.length; i++)
						this._createTransitions(item.innerStates[i], item.innerStates.slice(i + 1).concat(nextStates));
				}
				break;
			case AutomataStateType.OPTIONAL:
				for (let i = 0; i < state.innerStates.length; i++)
					this._createTransitions(state.innerStates[i], state.innerStates.slice(i + 1).concat(nextStates));

				break;
			case AutomataStateType.VARIABLE:
				if (state.innerStates.length) {
					// Se a variável tiver uma lista de opções,
					// manda criar as transições a partir da lista
					this._createTransitions(state.innerStates[0], nextStates);
					break;
				}

				// * Fall through para tratar variável simples
			default:
				for (const nextState of nextStates) {
					const possibilities = this._getPossibleTransitions(nextState);
					possibleTransitions.push(...possibilities.transitions);
					if (possibilities.stop)
						break;
				}

				// Registra as transições dos estados ignorando estados sem transições
				if (possibleTransitions.length)
					this._transitionTable.set(state.id, possibleTransitions);

				break;
		}
	}

	/**
	 * Processa um estado do autômato para identificar as transições que podem ser geradas a partir dele
	 * @param state Estado do autômato a ser avaliado
	 */
	private _getPossibleTransitions (state: AutomataState): { transitions: AutomataState[]; stop: boolean; } {
		const result = { transitions: [] as AutomataState[], stop: false };

		switch (state.type) {
			case AutomataStateType.LIST:
				for (const item of state.innerStates) {
					for (const innerState of item.innerStates) {
						const possibilities = this._getPossibleTransitions(innerState);
						result.transitions.push(...possibilities.transitions);
						if (possibilities.stop)
							break;
					}
				}

				// Listas são estados obrigatórios, logo param a busca por transições
				result.stop = true;
				break;
			case AutomataStateType.OPTIONAL:
				for (const innerState of state.innerStates) {
					const possibilities = this._getPossibleTransitions(innerState);
					result.transitions.push(...possibilities.transitions);
					if (possibilities.stop)
						break;
				}

				// Estados opcionais não param a busca por transições
				result.stop = false;
				break;
			case AutomataStateType.VARIABLE:
				if (state.innerStates.length) {
					// Se a variável tiver uma lista de opções,
					// manda criar as transições a partir da lista
					const possibilities = this._getPossibleTransitions(state.innerStates[0]);
					result.transitions.push(...possibilities.transitions);

					// Variáveis que são listas são estados obrigatórios, logo param a busca por transições
					result.stop = true;
					break;
				}

				// * Fall through para tratar variável simples
			default:
				result.transitions.push(state);

				// Termos e variáveis são estados obrigatórios, logo param a busca por transições
				result.stop = true;
				break;
		}

		return result;
	}

	/**
	 * Identifica e obtém a lista com os estados iniciais do autômato
	 */
	private _getInitialStates (): AutomataState[] {
		const queue = this._states.slice();
		const initialStates = [];
		let s = queue.shift();

		while (s) {
			if (s.innerStates.length)
				queue.push(...s.innerStates);

			if (s.isInitial)
				initialStates.push(s);

			s = queue.shift();
		}

		return initialStates;
	}

	/**
	 * Verifica se o usuário falou um comando reconhecido por este autômato
	 * @param str Transcrição do conteúdo falado pelo usuário
	 */
	public match (str: string): Match;

	/**
	 * Verifica se o usuário falou um comando reconhecido por este autômato, retornando todos os possíveis reconhecimentos
	 * @param str Transcrição do conteúdo falado pelo usuário
	 * @param allMatches Caso o autômato seja ambíguo, faz com que todos os possíveis reconhecimentos sejam retornados
	 */
	public match (str: string, allMatches: true): Match[];

	/**
	 * Verifica se o usuário falou um comando reconhecido por este autômato
	 * @param str Transcrição do conteúdo falado pelo usuário
	 * @param allMatches Caso o autômato seja ambíguo, define se todos os possíveis reconhecimentos devem ser retornados (verdadeiro) ou apenas o primeiro (falso)
	 */
	public match (str: string, allMatches: boolean = false): Match | Match[] {
		let currentStates: Array<{ state: AutomataState, matchObj: Match }> = [];
		const initialStates = this._getInitialStates();

		const input = str.split(" ");
		let currentWord = input.shift() || "";

		for (const state of initialStates) {
			// Ignora estado inicial que não reconhece a primeira palavra falada pelo usuário
			if (!state.match(currentWord))
				continue;

			const matchObj = new Match(true, this._defaultVariables);
			if (state.type === AutomataStateType.VARIABLE) {
				matchObj.variables[state.value] = currentWord;
			} else {
				// Se esse estado estiver associado a alguma variável, adiciona o termo a ela no resultado
				const associatedVariables = this._statesToVariablesMap.get(state.id) || [];
				for (const v of associatedVariables)
					matchObj.variables[this._statesMap.get(v)!.value] = currentWord;
			}

			currentStates.push({ state, matchObj });
		}

		while (currentStates.length && input.length) {
			const nextStates = [];
			currentWord = input.shift() || "";

			for (const { state, matchObj } of currentStates) {
				const transitions = this._transitionTable.get(state.id) || [];
				for (const t of transitions) {
					// Ignora transição que não reconhece a palavra falada pelo usuário
					if (!t.match(currentWord))
						continue;

					const transitionMatchObj = new Match(true, matchObj.variables);
					if (t.type === AutomataStateType.VARIABLE) {
						transitionMatchObj.variables[t.value] += (transitionMatchObj.variables[t.value].length ? " " : "") + currentWord;
					} else {
						// Se esse estado estiver associado a alguma variável, adiciona o termo a ela no resultado
						const associatedVariables = this._statesToVariablesMap.get(t.id) || [];
						for (const v of associatedVariables) {
							const key = this._statesMap.get(v)!.value;
							transitionMatchObj.variables[key] += (transitionMatchObj.variables[key].length ? " " : "") + currentWord;
						}
					}

					nextStates.push({ state: t, matchObj: transitionMatchObj });
				}

				// Se o estado for uma variável, considera a possibilidade da palavra ser parte dessa variável,
				// mesmo se houver uma transição válida para ela
				if (state.type === AutomataStateType.VARIABLE) {
					matchObj.variables[state.value] += " " + currentWord;
					nextStates.push({ state, matchObj });
				}
			}

			currentStates = nextStates;
		}

		// Após o processamento de todas as palavras faladas, apenas estados resultantes que são finais são válidos para o reconhecimento do comando
		currentStates = currentStates.filter(c => c.state.isFinal);
		if (!currentStates.length)
			return new Match(false);

		// É considerado o melhor reconhecimento aquele que menos usou palavras como valores de variáveis,
		// ou seja, aqueles que reconheceram o máximo de termos opcionais aplicáveis
		let bestMatch = currentStates[0].matchObj;
		for (let i = 1; i < currentStates.length; i++) {
			if (currentStates[i].matchObj.variablesWordCount < bestMatch.variablesWordCount)
				bestMatch = currentStates[i].matchObj;
		}

		bestMatch.isBest = true;
		return !allMatches ? bestMatch : currentStates.map(c => c.matchObj);
	}

	/**
	 * Obtém a lista todos os comandos possíveis de serem reconhecidos por este autômato
	 */
	public getAllPossibilities (): string[] {
		let currentStates: Array<{ state: AutomataState, cmd: string }> = [];

		const possibilities = [];
		const initialStates = this._getInitialStates();

		for (const state of initialStates) {
			const cmd = state.type === AutomataStateType.VARIABLE ? `{${state.value}}` : state.value;
			currentStates.push({ state, cmd });
		}

		while (currentStates.length) {
			const nextStates = [];
			for (const { state, cmd } of currentStates) {
				const transitions = this._transitionTable.get(state.id) || [];
				for (const t of transitions) {
					const transitionCmd = t.type === AutomataStateType.VARIABLE ? `{${t.value}}` : t.value;
					nextStates.push({ state: t, cmd: `${cmd} ${transitionCmd}` });
				}

				if (state.isFinal)
					possibilities.push(cmd);
			}

			currentStates = nextStates;
		}

		return possibilities;
	}
}
