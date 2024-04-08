import { Automata } from "../src/automata/automata";

const automata = new Automata(`
	{ VARIABLE 0 (
		testing { VARIABLE 1 (
			what the { VARIABLE 2 (result [will] be, result will be) },
			inner variable value,
			{VARIABLE 3}
		) }
	) }
`);

console.log(automata.getAllPossibilities());
console.log(automata.match("testing what the result will be"));
console.log(automata.match("testing inner variable value"));
console.log(automata.match("testing some random words"));
