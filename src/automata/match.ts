/**
 * Representa a correspondência ou não entre uma fala do usuário e um autômato
 */
export class Match {
	/**
	 * Define se o comando foi reconhecido pelo autômato
	 */
	public match: boolean;

	/**
	 * Registro dos valores reconhecidos para cada variável que compõe o autômato
	 */
	public variables: Record<string, string>;

	/**
	 * Flag que indica se este objeto de correspondência é considerado o melhor dentre as possibilidades de reconhecimento do autômato
	 */
	public isBest: boolean;

	/**
	 * Define um objeto de correspondência entre uma fala do usuário e um autômato
	 * @param match Define se o comando foi reconhecido pelo autômato
	 * @param variables Variáveis e seus valores já reconhecidos pelo autômato
	 */
	constructor (match: boolean, variables: Record<string, string> = {}) {
		this.match = match;
		this.variables = JSON.parse(JSON.stringify(variables));
		this.isBest = false;
	}

	/**
	 * Quantidade de palavras reconhecidas pelo autômato como sendo parte das variáveis do autômato
	 */
	public get variablesWordCount (): number {
		let counter = 0;
		for (const v in this.variables)
			counter += this.variables[v].split(" ").length;

		return counter;
	}
}
