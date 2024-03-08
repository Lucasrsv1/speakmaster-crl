/**
 * Representa a correspondência ou não entre uma fala do usuário e um autômato
 */
class Match {
	/**
	 * Define se o comando foi reconhecido pelo autômato
	 * @type {boolean}
	 */
	match;

	/**
	 * Registro dos valores reconhecidos para cada variável que compõe o autômato
	 * @type {Record<string, string>}
	 */
	variables;

	/**
	 * Flag que indica se este objeto de correspondência é considerado o melhor dentre as possibilidades de reconhecimento do autômato
	 * @type {boolean}
	 */
	isBest;

	/**
	 * Define um objeto de correspondência entre uma fala do usuário e um autômato
	 * @param {boolean} match Define se o comando foi reconhecido pelo autômato
	 * @param {Record<string, string>} variables Variáveis e seus valores já reconhecidos pelo autômato
	 */
	constructor (match, variables = {}) {
		this.match = match;
		this.variables = JSON.parse(JSON.stringify(variables));
		this.isBest = false;
	}

	/**
	 * Quantidade de palavras reconhecidas pelo autômato como sendo parte das variáveis do autômato
	 */
	get variablesWordCount () {
		let counter = 0;
		for (const v in this.variables)
			counter += this.variables[v].split(" ").length;

		return counter;
	}
}

module.exports = Match;
