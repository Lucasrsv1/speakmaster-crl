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

console.log(automata.command);
console.log(automata.getVariablesNames());
console.log(automata.getRestrictedVariablesNames());
console.log(automata.getUnrestrictedVariablesNames());

console.log(automata.getRestrictedVariableOptions("VARIABLE 0"));
console.log(automata.getRestrictedVariableOptions("VARIABLE 1"));
console.log(automata.getRestrictedVariableOptions("VARIABLE 2"));
console.log(automata.getRestrictedVariableOptions("VARIABLE 3"));

console.dir((automata as any)._states, { depth: null });
