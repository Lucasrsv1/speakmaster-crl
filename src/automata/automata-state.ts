/**
 * Define o tipo e comportamento de um estado de um autômato
 */
export enum AutomataStateType {
	/**
	 * Estado padrão que representa uma palavra específica
	 */
	TERM = "TERM",

	/**
	 * Estado opcional que não é essencial para que o autômato reconheça a entrada
	 */
	OPTIONAL = "OPTIONAL",

	/**
	 * Estado que representa uma lista de possíveis estados
	 */
	LIST = "LIST",

	/**
	 * Estado que representa um item da lista de possíveis estados
	 */
	ITEM = "ITEM",

	/**
	 * Estado que representa uma variável
	 */
	VARIABLE = "VARIABLE"
}

/**
 * Representa um estado que compõe um autômato
 */
export class AutomataState {
	/**
	 * Identificador único do estado
	 */
	public id: symbol;

	/**
	 * Conteúdo representado pelo estado
	 */
	public value: string;

	/**
	 * Define o tipo do estado
	 */
	public type: AutomataStateType;

	/**
	 * Define se este é um estado inicial do autômato
	 */
	public isInitial: boolean;

	/**
	 * Define se este é um estado final do autômato
	 */
	public isFinal: boolean;

	/**
	 * Lista de estados internos contidos destro deste estado
	 */
	public innerStates: AutomataState[];

	/**
	 * Define um estado que compõe um autômato
	 * @param value Conteúdo representado pelo estado
	 * @param type Define o tipo do estado
	 * @param isInitial Define se este é um estado inicial do autômato
	 * @param isFinal Define se este é um estado final do autômato
	 * @param innerStates Lista de estados internos contidos destro deste estado
	 */
	constructor (value: string, type: AutomataStateType, isInitial: boolean = false, isFinal: boolean = false, innerStates: AutomataState[] = []) {
		this.id = Symbol(`${Date.now()}-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`);
		this.value = value;
		this.type = type;
		this.isInitial = isInitial;
		this.isFinal = isFinal;
		this.innerStates = innerStates;
	}

	/**
	 * Verifica se outro estado de um autômato é equivalente a este
	 * @param other Outro estado de um autômato
	 */
	public equals (other: AutomataState): boolean {
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
	 * @param content Conteúdo a ser validado para se descobrir se o estado o reconhece ou não
	 */
	public match (content: string): boolean {
		return this.type === AutomataStateType.VARIABLE || (
			this.type === AutomataStateType.TERM && this.value === content
		);
	}

	/**
	 * Define um estado que compõe um autômato sem especificar se ele é inicial e/ou final
	 * @param value Conteúdo representado pelo estado
	 * @param type Define o tipo do estado
	 * @param innerStates Lista de estados internos contidos destro deste estado
	 */
	public static create (value: string, type: AutomataStateType, innerStates: AutomataState[] = []): AutomataState {
		return new AutomataState(value, type, false, false, innerStates);
	}
}
