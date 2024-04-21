import { Automata } from "../src/automata/automata";

const automata = new Automata("move mouse {DIRECTION (up, down, left, right)}");

console.log(automata.getAllPossibilities());
console.log(automata.match("move mouse up"));
console.log(automata.match("move mouse down"));
console.log(automata.match("move mouse left"));
console.log(automata.match("move mouse right"));

console.log(automata.getRestrictedVariableOptions("DIRECTION"));
