import { Automata } from "../src/automata/automata";

const automata = new Automata("move mouse {DIRECTION (Up, Down, Left, Right)}");

console.log(automata.match("move mouse up"));
console.log(automata.match("MOVE mouse Down"));
console.log(automata.match("move mouse Left"));
console.log(automata.match("move mouse RIGHT"));

console.log(automata.match("move mouse up", true));
console.log(automata.match("MOVE mouse Down", true));
console.log(automata.match("move mouse Left", true));
console.log(automata.match("move mouse RIGHT", false));

console.log(automata.match("move mouse RIGHT", true, true));
console.log(automata.match("move mouse RIGHT", false, true));

console.log(automata.match(`
	\t\rMOVE  \n\t\rmouse  Down
`));
