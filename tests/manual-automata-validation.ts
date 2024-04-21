/* eslint-disable dot-notation */

import { Automata } from "../src/automata/automata";
import { AutomataState, AutomataStateType } from "../src/automata/automata-state";

import interpreter from "../src/interpreter";


function setDebug (on: boolean): void {
	interpreter.debugging = on == true;
	interpreter.lexicalDebugging = on == true;
	interpreter.syntacticDebugging = on == true;
	Automata.debugging = on == true;
}

// * Exemplo: play [[the [really awesome]] song] {SONG NAME} from [[the] {ALBUM TYPE (album, [blu-ray] disc, great vinyl [record])} called] {ALBUM}

/**
 * Lista de estados a ser gerada pelo interpretador
 */
const states = [
	new AutomataState("play", AutomataStateType.TERM, true, false),
	new AutomataState("[[the [really awesome]] song]", AutomataStateType.OPTIONAL, false, false, [
		new AutomataState("[the [really awesome]]", AutomataStateType.OPTIONAL, false, false, [
			new AutomataState("the", AutomataStateType.TERM, false, false),
			new AutomataState("[really awesome]", AutomataStateType.OPTIONAL, false, false, [
				new AutomataState("really", AutomataStateType.TERM, false, false),
				new AutomataState("awesome", AutomataStateType.TERM, false, false)
			])
		]),
		new AutomataState("song", AutomataStateType.TERM, false, false)
	]),
	new AutomataState("SONG NAME", AutomataStateType.VARIABLE, false, false),
	new AutomataState("from", AutomataStateType.TERM, false, false),
	new AutomataState("[[the] {ALBUM TYPE (album, [blu-ray] disc, great vinyl [record])} called]", AutomataStateType.OPTIONAL, false, false, [
		new AutomataState("[the]", AutomataStateType.OPTIONAL, false, false, [
			new AutomataState("the", AutomataStateType.TERM, false, false)
		]),
		new AutomataState("ALBUM TYPE", AutomataStateType.VARIABLE, false, false, [
			new AutomataState("(album, [blu-ray] disc, great vinyl [record])", AutomataStateType.LIST, false, false, [
				new AutomataState("album", AutomataStateType.ITEM, false, false, [
					new AutomataState("album", AutomataStateType.TERM, false, false)
				]),
				new AutomataState("[blu-ray] disc", AutomataStateType.ITEM, false, false, [
					new AutomataState("[blu-ray]", AutomataStateType.OPTIONAL, false, false, [
						new AutomataState("blu-ray", AutomataStateType.TERM, false, false)
					]),
					new AutomataState("disc", AutomataStateType.TERM, false, false)
				]),
				new AutomataState("great vinyl [record]", AutomataStateType.ITEM, false, false, [
					new AutomataState("great", AutomataStateType.TERM, false, false),
					new AutomataState("vinyl", AutomataStateType.TERM, false, false),
					new AutomataState("[record]", AutomataStateType.OPTIONAL, false, false, [
						new AutomataState("record", AutomataStateType.TERM, false, false)
					])
				])
			])
		]),
		new AutomataState("called", AutomataStateType.TERM, false, false)
	]),
	new AutomataState("ALBUM", AutomataStateType.VARIABLE, false, true)
];

/**
 * Associa a chave de um estado ao próprio estado
 */
const statesMap = new Map();

/**
 * Tabela de transição do autômato a ser gerada pela classe Automata
 */
const transitionTable = new Map();

// * play -> the | song | SONG NAME
transitionTable.set(states[0].id, [
	// OPTIONAL.OPTIONAL.TERM => the
	states[1].innerStates[0].innerStates[0],

	// OPTIONAL.TERM => song
	states[1].innerStates[1],

	// VARIABLE => SONG NAME
	states[2]
]);
statesMap.set(states[0].id, states[0]);

// * the -> really | song
transitionTable.set(states[1].innerStates[0].innerStates[0].id, [
	// OPTIONAL.OPTIONAL.OPTIONAL.TERM => really
	states[1].innerStates[0].innerStates[1].innerStates[0],

	// OPTIONAL.TERM => song
	states[1].innerStates[1]
]);
statesMap.set(states[1].innerStates[0].innerStates[0].id, states[1].innerStates[0].innerStates[0]);

// * really -> awesome
transitionTable.set(states[1].innerStates[0].innerStates[1].innerStates[0].id, [
	// OPTIONAL.OPTIONAL.OPTIONAL.TERM => awesome
	states[1].innerStates[0].innerStates[1].innerStates[1]
]);
statesMap.set(states[1].innerStates[0].innerStates[1].innerStates[0].id, states[1].innerStates[0].innerStates[1].innerStates[0]);

// * awesome -> song
transitionTable.set(states[1].innerStates[0].innerStates[1].innerStates[1].id, [
	// OPTIONAL.TERM => song
	states[1].innerStates[1]
]);
statesMap.set(states[1].innerStates[0].innerStates[1].innerStates[1].id, states[1].innerStates[0].innerStates[1].innerStates[1]);

// * song -> SONG NAME
transitionTable.set(states[1].innerStates[1].id, [
	// VARIABLE => SONG NAME
	states[2]
]);
statesMap.set(states[1].innerStates[1].id, states[1].innerStates[1]);

// * SONG NAME -> from
transitionTable.set(states[2].id, [
	// TERM => from
	states[3]
]);
statesMap.set(states[2].id, states[2]);

// * from -> the | album | blu-ray | disc | great | ALBUM
transitionTable.set(states[3].id, [
	// OPTIONAL.OPTIONAL.TERM => the
	states[4].innerStates[0].innerStates[0],

	// OPTIONAL.LIST.ITEM.TERM => album
	states[4].innerStates[1].innerStates[0].innerStates[0].innerStates[0],

	// OPTIONAL.LIST.ITEM.OPTIONAL.TERM => blu-ray
	states[4].innerStates[1].innerStates[0].innerStates[1].innerStates[0].innerStates[0],

	// OPTIONAL.LIST.ITEM.TERM => disc
	states[4].innerStates[1].innerStates[0].innerStates[1].innerStates[1],

	// OPTIONAL.LIST.ITEM.TERM => great
	states[4].innerStates[1].innerStates[0].innerStates[2].innerStates[0],

	// VARIABLE => ALBUM
	states[5]
]);
statesMap.set(states[3].id, states[3]);

// * the -> album | blu-ray | disc | great
transitionTable.set(states[4].innerStates[0].innerStates[0].id, [
	// OPTIONAL.LIST.ITEM.TERM => album
	states[4].innerStates[1].innerStates[0].innerStates[0].innerStates[0],

	// OPTIONAL.LIST.ITEM.OPTIONAL.TERM => blu-ray
	states[4].innerStates[1].innerStates[0].innerStates[1].innerStates[0].innerStates[0],

	// OPTIONAL.LIST.ITEM.TERM => disc
	states[4].innerStates[1].innerStates[0].innerStates[1].innerStates[1],

	// OPTIONAL.LIST.ITEM.TERM => great
	states[4].innerStates[1].innerStates[0].innerStates[2].innerStates[0]
]);
statesMap.set(states[4].innerStates[0].innerStates[0].id, states[4].innerStates[0].innerStates[0]);

// * album -> called
transitionTable.set(states[4].innerStates[1].innerStates[0].innerStates[0].innerStates[0].id, [
	// OPTIONAL.TERM => called
	states[4].innerStates[2]
]);
statesMap.set(states[4].innerStates[1].innerStates[0].innerStates[0].innerStates[0].id, states[4].innerStates[1].innerStates[0].innerStates[0].innerStates[0]);

// * blu-ray -> disc
transitionTable.set(states[4].innerStates[1].innerStates[0].innerStates[1].innerStates[0].innerStates[0].id, [
	// OPTIONAL.LIST.ITEM.TERM => disc
	states[4].innerStates[1].innerStates[0].innerStates[1].innerStates[1]
]);
statesMap.set(states[4].innerStates[1].innerStates[0].innerStates[1].innerStates[0].innerStates[0].id, states[4].innerStates[1].innerStates[0].innerStates[1].innerStates[0].innerStates[0]);

// * disc -> called
transitionTable.set(states[4].innerStates[1].innerStates[0].innerStates[1].innerStates[1].id, [
	// OPTIONAL.TERM => called
	states[4].innerStates[2]
]);
statesMap.set(states[4].innerStates[1].innerStates[0].innerStates[1].innerStates[1].id, states[4].innerStates[1].innerStates[0].innerStates[1].innerStates[1]);

// * great -> vinyl
transitionTable.set(states[4].innerStates[1].innerStates[0].innerStates[2].innerStates[0].id, [
	// OPTIONAL.LIST.ITEM.TERM => vinyl
	states[4].innerStates[1].innerStates[0].innerStates[2].innerStates[1]
]);
statesMap.set(states[4].innerStates[1].innerStates[0].innerStates[2].innerStates[0].id, states[4].innerStates[1].innerStates[0].innerStates[2].innerStates[0]);

// * vinyl -> record | called
transitionTable.set(states[4].innerStates[1].innerStates[0].innerStates[2].innerStates[1].id, [
	// OPTIONAL.LIST.ITEM.OPTIONAL.TERM => record
	states[4].innerStates[1].innerStates[0].innerStates[2].innerStates[2].innerStates[0],

	// OPTIONAL.TERM => called
	states[4].innerStates[2]
]);
statesMap.set(states[4].innerStates[1].innerStates[0].innerStates[2].innerStates[1].id, states[4].innerStates[1].innerStates[0].innerStates[2].innerStates[1]);

// * record -> called
transitionTable.set(states[4].innerStates[1].innerStates[0].innerStates[2].innerStates[2].innerStates[0].id, [
	// OPTIONAL.TERM => called
	states[4].innerStates[2]
]);
statesMap.set(states[4].innerStates[1].innerStates[0].innerStates[2].innerStates[2].innerStates[0].id, states[4].innerStates[1].innerStates[0].innerStates[2].innerStates[2].innerStates[0]);

// * called -> ALBUM
transitionTable.set(states[4].innerStates[2].id, [
	// VARIABLE => ALBUM
	states[5]
]);
statesMap.set(states[4].innerStates[2].id, states[4].innerStates[2]);

// Validação da implementação

setDebug(true);
const realAutomata = new Automata("play [[the [really awesome]] song] {SONG NAME} from [[the] {ALBUM TYPE (album, [blu-ray] disc, great vinyl [record])} called] {ALBUM}");
const realAutomataPossibilities = realAutomata.getAllPossibilities();
console.log(realAutomataPossibilities);

// Validação das possibilidades geradas

setDebug(false);
const test = new Automata("play [[the [really awesome]] song] {SONG NAME} from [[the] (album, [blu-ray] disc, great vinyl [record]) called] {ALBUM}");
const testPossibilities = test.getAllPossibilities();
if (realAutomataPossibilities.length !== testPossibilities.length) {
	console.error(`\nThe real implementation os the Automata class resulted in ${realAutomataPossibilities.length} possibilities, but ${testPossibilities.length} were expected`);
} else {
	console.log("\nThe real implementation os the Automata class resulted in the expected amount of possibilities");

	let errors = 0;
	for (let i = 0; i <= testPossibilities.length; i++) {
		if (realAutomataPossibilities[i] !== testPossibilities[i]) {
			console.error(`\nThe real implementation os the Automata class resulted in a different possibility from what was expected at index ${i}\nFound: ${realAutomataPossibilities[i]}. Expected: ${testPossibilities[i]}`);
			errors++;
		}
	}

	if (errors > 0)
		console.error(`The real implementation os the Automata class resulted in ${errors} wrong possibilities`);
	else
		console.log("The real implementation os the Automata class resulted in the expected possibilities");
}

// Validação dos estados

let index = 0;
let isRealAutomataEqualSoFar = states.length === realAutomata["_states"].length;

for (; index < states.length && isRealAutomataEqualSoFar; index++)
	isRealAutomataEqualSoFar &&= states[index].equals(realAutomata["_states"][index]);

if (isRealAutomataEqualSoFar)
	console.log("\nThe real implementation os the Automata class resulted in the expected states");
else if (index > 0)
	console.error("\nThe real implementation os the Automata class resulted in states different from what was expected at index", index - 1);
else
	console.error(`\nThe real implementation os the Automata class resulted in ${realAutomata["_states"].length} states, but ${states.length} were expected`);

// Validação da tabela de transições

isRealAutomataEqualSoFar = transitionTable.size === realAutomata["_transitionTable"].size;
if (isRealAutomataEqualSoFar) {
	for (const key of transitionTable.keys()) {
		const realStates = Array.from(realAutomata["_statesMap"].values()).filter(s => s.equals(statesMap.get(key)));
		if (!realStates.length) {
			isRealAutomataEqualSoFar = false;
			console.error(`\nThe real implementation os the Automata class has no transitions for state "${statesMap.get(key).value}"`);
			break;
		}

		let foundValidState = false;
		for (const realState of realStates) {
			const realTransitions = realAutomata["_transitionTable"].get(realState.id) || [];
			if (!foundValidState && realTransitions.length === transitionTable.get(key).length) {
				foundValidState = true;
				for (const possibleState of transitionTable.get(key))
					foundValidState &&= Boolean(realTransitions.find(s => s.equals(possibleState)));
			}
		}

		if (!foundValidState) {
			isRealAutomataEqualSoFar = false;
			console.error(`\nThe real implementation os the Automata class didn't have proper transitions for state "${statesMap.get(key).value}", but ${transitionTable.get(key).length} transitions were expected`);
			break;
		}

	}
} else {
	console.error(`\nThe real implementation os the Automata class resulted in ${realAutomata["_transitionTable"].size} transitions, but ${transitionTable.size} were expected`);
}

if (isRealAutomataEqualSoFar)
	console.log("The real implementation os the Automata class resulted in the expected transition table");
else
	console.error("The real implementation os the Automata class resulted in a different transition table from what was expected");

console.assert(
	realAutomata.getVariablesNames().sort().join(", ") === "ALBUM, ALBUM TYPE, SONG NAME",
	"The real implementation os the Automata class didn't have the expected variables names:",
	realAutomata.getVariablesNames()
);

console.assert(
	realAutomata.getRestrictedVariablesNames().join(", ") === "ALBUM TYPE",
	"The real implementation os the Automata class didn't have the expected restricted variables names:",
	realAutomata.getRestrictedVariablesNames()
);

console.assert(
	realAutomata.getUnrestrictedVariablesNames().sort().join(", ") === "ALBUM, SONG NAME",
	"The real implementation os the Automata class didn't have the expected unrestricted variables names:",
	realAutomata.getUnrestrictedVariablesNames()
);

console.assert(
	realAutomata.getRestrictedVariableOptions("ALBUM").join(", ") === "",
	"The real implementation os the Automata class didn't have the expected options for variable ALBUM:",
	realAutomata.getRestrictedVariableOptions("ALBUM")
);

console.assert(
	realAutomata.getRestrictedVariableOptions("ALBUM TYPE").sort().join(", ") === "[blu-ray] disc, album, great vinyl [record]",
	"The real implementation os the Automata class didn't have the expected options for variable ALBUM TYPE:",
	realAutomata.getRestrictedVariableOptions("ALBUM TYPE")
);
