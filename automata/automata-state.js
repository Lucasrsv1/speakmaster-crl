/**
 * Representa um estado que compõe um autômato
 */
class AutomataState {
	/**
	 * Identificador único do estado
	 * @type {symbol}
	 */
	id;

	/**
	 * Conteúdo representado pelo estado
	 * @type {string}
	 */
	value;

	/**
	 * Define o tipo do estado
	 * @type {AutomataState.AutomataStateType}
	 */
	type;

	/**
	 * Define se este é um estado inicial do autômato
	 * @type {boolean}
	 */
	isInitial;

	/**
	 * Define se este é um estado final do autômato
	 * @type {boolean}
	 */
	isFinal;

	/**
	 * Lista de estados internos contidos destro deste estado
	 * @type {AutomataState[]}
	 */
	innerStates;

	/**
	 * Define um estado que compõe um autômato
	 * @param {string} value Conteúdo representado pelo estado
	 * @param {AutomataState.AutomataStateType} type Define o tipo do estado
	 * @param {boolean} isInitial Define se este é um estado inicial do autômato
	 * @param {boolean} isFinal Define se este é um estado final do autômato
	 * @param {AutomataState[]} innerStates Lista de estados internos contidos destro deste estado
	 */
	constructor (value, type, isInitial = false, isFinal = false, innerStates = []) {
		this.id = Symbol(`${Date.now()}-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`);
		this.value = value;
		this.type = type;
		this.isInitial = isInitial;
		this.isFinal = isFinal;
		this.innerStates = innerStates;
	}

	/**
	 * Verifica se outro estado de um autômato é equivalente a este
	 * @param {AutomataState} other Outro estado de um autômato
	 * @returns {boolean}
	 */
	equals (other) {
		if (
			this.value !== other.value ||
			this.type !== other.type ||
			this.isInitial !== other.isInitial ||
			this.isFinal !== other.isFinal ||
			this.innerStates.length !== other.innerStates.length
		)
			return false;

		for (let i = 0; i < this.innerStates.length; i++) {
			if (!this.innerStates[i].equals(other.innerStates[i]))
				return false;
		}

		return true;
	}

	/**
	 * Verifica se o estado do autômato reconhece dado termo ou não
	 * @param {string} content Conteúdo a ser validado para se descobrir se o estado o reconhece ou não
	 * @returns {boolean}
	 */
	match (content) {
		return this.type === AutomataState.AutomataStateType.VARIABLE || (
			this.type === AutomataState.AutomataStateType.TERM && this.value === content
		);
	}

	/**
	 * Define um estado que compõe um autômato sem especificar se ele é inicial e/ou final
	 * @param {string} value Conteúdo representado pelo estado
	 * @param {AutomataState.AutomataStateType} type Define o tipo do estado
	 * @param {AutomataState[]} innerStates Lista de estados internos contidos destro deste estado
	 * @returns {AutomataState}
	 */
	static create (value, type, innerStates = []) {
		return new AutomataState(value, type, false, false, innerStates);
	}
}

/**
 * Define o tipo e comportamento de um estado de um autômato
 * @enum {string}
 */
AutomataState.AutomataStateType = Object.freeze({
	/**
	 * Estado padrão que representa uma palavra específica
	 */
	TERM: "TERM",

	/**
	 * Estado opcional que não é essencial para que o autômato reconheça a entrada
	 */
	OPTIONAL: "OPTIONAL",

	/**
	 * Estado que representa uma lista de possíveis estados
	 */
	LIST: "LIST",

	/**
	 * Estado que representa um item da lista de possíveis estados
	 */
	ITEM: "ITEM",

	/**
	 * Estado que representa uma variável
	 */
	VARIABLE: "VARIABLE"
});

module.exports = AutomataState;
