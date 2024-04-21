import { Automata } from "../src/automata/automata";

Automata.debugging = true;

const automata = new Automata("[{VARIÁVEL}] usando a mesma {VARIÁVEL (variável, variável [de] teste)} [para fazer {VARIÁVEL (o [mesmo] trabalho, a [mesma] tarefa)}]");

console.dir(automata.getAllPossibilities().map(
	p => [p, automata.match(p.replace("{VARIÁVEL}", "estou"))]
), { depth: null });

// O autômato possui apenas uma variável, embora ela apareça três vezes no comando
console.log(automata.getVariablesNames());

// VARIÁVEL deve estar listada como restrita, pois possui ao menos um ponto no autômato em que ela aceita apenas valores específicos/restritos
console.log(automata.getRestrictedVariablesNames());

// VARIÁVEL deve estar listada como irrestrita também, pois possui ao menos um ponto no autômato em que ela aceita qualquer valor
console.log(automata.getUnrestrictedVariablesNames());

// Apenas a última restrição deve ser mantida, pois o índice associado à variável no retorno do match refere-se apenas à última restrição
console.log(automata.getRestrictedVariableOptions("VARIÁVEL"));

console.dir((automata as any)._states, { depth: null });
