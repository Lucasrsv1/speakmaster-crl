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

const error = validateSyntax("play [the] song] {SONG NAME}")!;

console.log(error.message, { line: error.line, column: error.column });
// Unexpected lexeme "]" at 16 { line: 1, column: 16 }
