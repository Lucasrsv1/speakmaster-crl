import { Automata, validateSyntax } from "../src";

// Para definir um comando:
// Passe a definição do comando usando a linguagem CRL como parâmetro na criação de uma instância da classe Automata
const command = new Automata("play [[the] song] {SONG NAME} from [[the] {ALBUM TYPE (album, disc, record)}] {ALBUM}");

// Para verificar se uma entrada é reconhecida por um comando:
console.log(command.match("play where do we go from brave enough"));
/*Match {
	match: true,
	variables: {
		'SONG NAME': 'where do we go',
		ALBUM: 'brave enough',
		'ALBUM TYPE': ''
	},
	restrictedVariablesIndexes: { 'ALBUM TYPE': -1 },
	isBest: true
}*/

console.log(command.match("play the song where do we go from the record brave enough"));
/*Match {
	match: true,
	variables: {
		'SONG NAME': 'where do we go',
		ALBUM: 'brave enough',
		'ALBUM TYPE': 'record'
	},
	restrictedVariablesIndexes: { 'ALBUM TYPE': 2 },
	isBest: true
}*/

console.log(command.match("play where do we go"));
/*Match {
	match: false,
	variables: {},
	restrictedVariablesIndexes: {},
	isBest: false
}*/

// Para obter todas as possibilidades de comandos:
console.log(command.getAllPossibilities());
/*[
	'play {SONG NAME} from {ALBUM}',
	'play song {SONG NAME} from {ALBUM}',
	'play {SONG NAME} from album {ALBUM}',
	'play {SONG NAME} from disc {ALBUM}',
	'play {SONG NAME} from record {ALBUM}',
	'play the song {SONG NAME} from {ALBUM}',
	'play song {SONG NAME} from album {ALBUM}',
	'play song {SONG NAME} from disc {ALBUM}',
	'play song {SONG NAME} from record {ALBUM}',
	'play {SONG NAME} from the album {ALBUM}',
	'play {SONG NAME} from the disc {ALBUM}',
	'play {SONG NAME} from the record {ALBUM}',
	'play the song {SONG NAME} from album {ALBUM}',
	'play the song {SONG NAME} from disc {ALBUM}',
	'play the song {SONG NAME} from record {ALBUM}',
	'play song {SONG NAME} from the album {ALBUM}',
	'play song {SONG NAME} from the disc {ALBUM}',
	'play song {SONG NAME} from the record {ALBUM}',
	'play the song {SONG NAME} from the album {ALBUM}',
	'play the song {SONG NAME} from the disc {ALBUM}',
	'play the song {SONG NAME} from the record {ALBUM}'
]*/

// Para obter o comando de entrada do autômato:
console.log(command.command);
// play [[the] song] {SONG NAME} from [[the] {ALBUM TYPE (album, disc, record)}] {ALBUM}

// Para obter informações sobre as variáveis do comando:
console.log(command.getVariablesNames());
// [ 'SONG NAME', 'ALBUM', 'ALBUM TYPE' ]

console.log(command.getRestrictedVariablesNames());
// [ 'ALBUM TYPE' ]

console.log(command.getUnrestrictedVariablesNames());
// [ 'SONG NAME', 'ALBUM' ]

console.log(command.getRestrictedVariableOptions("ALBUM TYPE"));
// [ 'album', 'disc', 'record' ]

// Passar uma variável irrestrita para a função getRestrictedVariableOptions irá retornar um vetor vazio
console.log(command.getRestrictedVariableOptions("SONG NAME"));
// []

console.log(command.getRestrictedVariableOptions("ALBUM"));
// []

// Para controlar se a avaliação deve diferenciar letras maiúsculas e minúsculas:
// Case sensitive
console.log(command.match("PLAY Where Do We Go FROM Brave Enough", true));
/*Match {
	match: false,
	variables: {},
	restrictedVariablesIndexes: {},
	isBest: false
}*/

// Case insensitive
console.log(command.match("PLAY Where Do We Go FROM Brave Enough", false));
/*Match {
	match: true,
	variables: {
	  'SONG NAME': 'Where Do We Go',
	  ALBUM: 'Brave Enough',
	  'ALBUM TYPE': ''
	},
	restrictedVariablesIndexes: { 'ALBUM TYPE': -1 },
	isBest: true
}*/

// Case insensitive é o padrão
console.log(command.match("PLAY Where Do We Go FROM Brave Enough"));
/*Match {
	match: true,
	variables: {
	  'SONG NAME': 'Where Do We Go',
	  ALBUM: 'Brave Enough',
	  'ALBUM TYPE': ''
	},
	restrictedVariablesIndexes: { 'ALBUM TYPE': -1 },
	isBest: true
}*/

// Para obter todos os reconhecimentos possíveis:
console.log(
	command.match("play the song where do we go from the record brave enough", false, true)
);
/*[
	Match {
		match: true,
		variables: {
			'SONG NAME': 'where do we go',
			ALBUM: 'brave enough',
			'ALBUM TYPE': 'record'
		},
		restrictedVariablesIndexes: { 'ALBUM TYPE': 2 },
		isBest: true
	},
	Match {
		match: true,
		variables: {
		'SONG NAME': 'where do we go',
		ALBUM: 'the record brave enough',
		'ALBUM TYPE': ''
		},
		restrictedVariablesIndexes: { 'ALBUM TYPE': -1 },
		isBest: false
	},
	Match {
		match: true,
		variables: {
			'SONG NAME': 'the song where do we go',
			ALBUM: 'brave enough',
			'ALBUM TYPE': 'record'
		},
		restrictedVariablesIndexes: { 'ALBUM TYPE': 2 },
		isBest: false
	},
	Match {
		match: true,
		variables: {
			'SONG NAME': 'the song where do we go',
			ALBUM: 'the record brave enough',
			'ALBUM TYPE': ''
		},
		restrictedVariablesIndexes: { 'ALBUM TYPE': -1 },
		isBest: false
	}
]*/

// Para apenas validar a sintaxe de um comando:
const error = validateSyntax("play [the] song] {SONG NAME}")!;

console.log(error.message, { line: error.line, column: error.column });
// Unexpected lexeme "]" at 16 { line: 1, column: 16 }
