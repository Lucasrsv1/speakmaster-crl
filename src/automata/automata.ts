// ? Um exemplo de montagem da tabela de transições do autômato se encontra no arquivo tests/manual-automata-validation.ts

import { AutomataState, AutomataStateType } from "./automata-state";

import interpreter from "../interpreter";
import { Match } from "./match";

/**
 * Representa o autômato executável de um comando
 */
export class Automata {
	/**
	 * String de definição e estruturação do comando deste autômato
	 */
	private _cmd: string;

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
	 * Inicializa o índice de cada variável restrita que compõe o autômato
	 */
	private _defaultRestrictedVariablesIndexes: Record<string, number> = {};

	/**
	 * Associa a chave de um estado às variáveis as quais ele pertence
	 */
	private _statesToVariablesMap: Map<symbol, symbol[]> = new Map();

	/**
	 * Associa a chave de um estado ao índice de cada variável restrita a qual ele pertence
	 */
	private _restrictedVariablesIndexTransitionsMap: Map<string, Array<{ state: symbol, index: number }>> = new Map();

	/**
	 * Registra a lista de itens da restrição de cada variável restrita
	 */
	private _restrictedVariablesItems: Map<string, string[]> = new Map();

	/**
	 * Lista dos nomes das variáveis que aparecem alguma vez de forma irrestrita no autômato
	 */
	private _unrestrictedVariablesNames: Set<string> = new Set();

	/**
	 * Flag de depuração do autômato
	 */
	public static debugging: boolean = false;

	/**
	 * Define um autômato de um comando
	 * @param cmd String de definição e estruturação de um comando
	 */
	constructor (cmd: string) {
		this._cmd = cmd;

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

			console.log("\n[Automata Log] State to restricted variable index:");
			for (const [variable, indexTransitions] of this._restrictedVariablesIndexTransitionsMap) {
				for (const { state, index } of indexTransitions)
					console.log(`[Automata Log] Transition to state "${this._statesMap.get(state)?.value}" will set restricted variable "${variable}" index to ${index}`);
			}
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
				if (s.innerStates.length) {
					this._mapToVariable(s.id, s.innerStates);
					this._defaultRestrictedVariablesIndexes[s.value] = -1;
				} else {
					this._unrestrictedVariablesNames.add(s.value);
				}
			}

			s = queue.shift();
		}
	}

	/**
	 * Associa estados às variáveis as quais eles estão relacionados
	 * @param variableID Identificador do estado que representa a variável
	 * @param states Lista com os estados que podem ocorrer para essa variável
	 */
	private _mapToVariable (variableID: symbol, states: AutomataState[]): void {
		for (const s of states) {
			if (s.innerStates.length)
				this._mapToVariable(variableID, s.innerStates);
			else
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
					const restrictedVariableItems: string[] = [];
					const indexTransitions: Array<{ state: symbol, index: number }> = [];

					// Percorre os itens da lista de opções desta variável restrita
					// identificando as possíveis transições iniciais de cada item da
					// lista a fim de associar a transição para estes estados com o
					// índice do item reconhecido pela variável restrita
					const items = state.innerStates[0].innerStates;
					for (let index = 0; index < items.length; index++) {
						// Registra o item atual como um dos itens da lista de restrições da variável
						restrictedVariableItems.push(items[index].value);

						const variableInitialStates = interpreter.getInitialStates(items[index].innerStates);
						for (const variableInitialState of variableInitialStates) {
							// Registra que transições para este estado deverão configurar o índice da
							// variável restrita para o valor do índice do item atual da lista de opções
							indexTransitions.push({ state: variableInitialState.id, index });
						}
					}

					// Salva a lista de restrições da variável mantendo apenas a última lista de restrições definida
					this._restrictedVariablesItems.set(state.value, restrictedVariableItems);

					// Salva as transições que devem identificar o índice do item reconhecido pela variável mantendo
					// apenas as transições da última lista de restrições definida para a variável
					this._restrictedVariablesIndexTransitionsMap.set(state.value, indexTransitions);

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
	 * Se o estado estiver associado a alguma variável, adiciona o termo a todas as variáveis associadas no objeto do resultado
	 * @param word Termo atual
	 * @param state Estado atual que reconhece o termo atual
	 * @param matchObj Objeto de reconhecimento associado ao estado atual
	 */
	private _appendToVariables (word: string, state: AutomataState, matchObj: Match): void {
		const associatedVariables = this._statesToVariablesMap.get(state.id) || [];
		for (const v of associatedVariables) {
			const variableName = this._statesMap.get(v)!.value;
			matchObj.variables[variableName] += (matchObj.variables[variableName].length ? " " : "") + word;
		}
	}

	/**
	 * Caso o estado esteja em uma lista de uma variável restrita, atualiza o índice da variável restrita
	 * @param state Estado atual que reconhece o termo atual
	 * @param matchObj Objeto de reconhecimento associado ao estado atual
	 */
	private _setRestrictedVariablesIndexes (state: AutomataState, matchObj: Match): void {
		for (const [variable, indexTransitions] of this._restrictedVariablesIndexTransitionsMap) {
			const transition = indexTransitions.find(t => t.state === state.id);
			if (transition)
				matchObj.restrictedVariablesIndexes[variable] = transition.index;
		}
	}

	/**
	 * Obtém o comando do autômato, ou seja, o código-fonte na linguagem CRL
	 */
	public get command (): string {
		return this._cmd;
	}

	/**
	 * Verifica se a entrada é um comando reconhecido por este autômato sem diferenciar letras maiúsculas e minúsculas
	 * @param str Entrada com o conteúdo a ser reconhecido pelo autômato
	 */
	public match (str: string): Match;

	/**
	 * Verifica se a entrada é um comando reconhecido por este autômato
	 * @param str Entrada com o conteúdo a ser reconhecido pelo autômato
	 * @param caseSensitive Caso seja verdadeiro, a comparação irá diferenciar letras maiúsculas e minúsculas
	 */
	public match (str: string, caseSensitive: boolean): Match;

	/**
	 * Verifica se a entrada é um comando reconhecido por este autômato, retornando todos os possíveis reconhecimentos
	 * @param str Entrada com o conteúdo a ser reconhecido pelo autômato
	 * @param caseSensitive Caso seja verdadeiro, a comparação irá diferenciar letras maiúsculas e minúsculas
	 * @param allMatches Caso o autômato seja ambíguo, faz com que todos os possíveis reconhecimentos sejam retornados
	 */
	public match (str: string, caseSensitive: boolean, allMatches: true): Match[];

	/**
	 * Verifica se a entrada é um comando reconhecido por este autômato
	 * @param str Entrada com o conteúdo a ser reconhecido pelo autômato
	 * @param caseSensitive Caso seja verdadeiro, a comparação irá diferenciar letras maiúsculas e minúsculas
	 * @param allMatches Caso o autômato seja ambíguo, define se todos os possíveis reconhecimentos devem ser retornados (verdadeiro) ou apenas o primeiro (falso)
	 */
	public match (str: string, caseSensitive: boolean = false, allMatches: boolean = false): Match | Match[] {
		let currentStates: Array<{ state: AutomataState, matchObj: Match }> = [];
		const initialStates = this._getInitialStates();

		const input = str.trim().split(" ");
		let currentWord = input.shift()?.trim() || "";

		for (const state of initialStates) {
			// Ignora estado inicial que não reconhece a primeira palavra da entrada
			if (!state.match(currentWord, caseSensitive))
				continue;

			const matchObj = new Match(true, this._defaultVariables, this._defaultRestrictedVariablesIndexes);
			if (state.type === AutomataStateType.VARIABLE)
				matchObj.variables[state.value] = currentWord;

			this._appendToVariables(currentWord, state, matchObj);
			this._setRestrictedVariablesIndexes(state, matchObj);

			currentStates.push({ state, matchObj });
		}

		while (currentStates.length && input.length) {
			const nextStates = [];
			currentWord = input.shift()?.trim() || "";

			// Ignora whitespace
			if (currentWord.length === 0)
				continue;

			for (const { state, matchObj } of currentStates) {
				const transitions = this._transitionTable.get(state.id) || [];
				for (const t of transitions) {
					// Ignora transição que não reconhece a palavra da entrada
					if (!t.match(currentWord, caseSensitive))
						continue;

					const transitionMatchObj = new Match(true, matchObj.variables, matchObj.restrictedVariablesIndexes);
					if (t.type === AutomataStateType.VARIABLE)
						transitionMatchObj.variables[t.value] += (transitionMatchObj.variables[t.value].length ? " " : "") + currentWord;

					this._appendToVariables(currentWord, t, transitionMatchObj);
					this._setRestrictedVariablesIndexes(t, transitionMatchObj);

					nextStates.push({ state: t, matchObj: transitionMatchObj });
				}

				// Se o estado for uma variável, considera a possibilidade da palavra ser parte dessa variável,
				// mesmo se houver uma transição válida para ela
				if (state.type === AutomataStateType.VARIABLE) {
					matchObj.variables[state.value] += " " + currentWord;
					this._appendToVariables(currentWord, state, matchObj);

					nextStates.push({ state, matchObj });
				}
			}

			currentStates = nextStates;
		}

		// Após o processamento de todas as palavras da entrada, apenas estados resultantes que são finais são válidos para o reconhecimento do comando
		currentStates = currentStates.filter(c => c.state.isFinal);
		if (!currentStates.length)
			return !allMatches ? new Match(false) : [];

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

	/**
	 * Obtém a lista dos nomes de todas as variáveis definidas no autômato
	 */
	public getVariablesNames (): string[] {
		return Object.keys(this._defaultVariables);
	}

	/**
	 * Obtém a lista dos nomes das variáveis restritas definidas no autômato
	 */
	public getRestrictedVariablesNames (): string[] {
		return Object.keys(this._defaultRestrictedVariablesIndexes);
	}

	/**
	 * Obtém a lista dos nomes das variáveis irrestritas definidas no autômato
	 */
	public getUnrestrictedVariablesNames (): string[] {
		return Array.from(this._unrestrictedVariablesNames);
	}

	/**
	 * Obtém a lista de restrições de uma dada variável restrita, sendo que cada item será uma
	 * opção de valor reconhecido pela variável restrita definido usando o a linguagem CRL
	 * @param variableName Nome da variável restrita
	 * @returns Retorna a lista de opções, ou um vetor vazio caso a variável não seja restrita
	 */
	public getRestrictedVariableOptions (variableName: string): string[] {
		return this._restrictedVariablesItems.get(variableName)?.slice() || [];
	}
}
