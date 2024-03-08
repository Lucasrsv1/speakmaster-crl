# Command Recognition Language

#### Linguagem para definição e estruturação de autômatos de comandos de voz

## Definição da gramática oficial no formato de Backus Naur Estendida (EBNF):

### Command Recognition Language (CRL)

```EBNF
<sentence> ::= <sentence> <sentence>
               <term>
               '[' <optional> ']'
               '(' <list> ')'
               '{' <variable> '}'

<optional> ::= <optional> <optional>
               <term>
               '[' <optional> ']'
               '(' <list> ')'
               '{' <variable> '}'

<list>     ::= <item>
               <item> ',' <list>

<item>     ::= <item> <item>
               <term>
               '[' <optional> ']'
               '(' <list> ')'
               '{' <variable> '}'

<variable> ::= <string> { <string> } ['(' <list> ')']

<term>     ::= <string>
```

**Estado inicial:** `<sentence>`

**Observação:** uma `<string>` deve ser uma string contínua sem espaços.

### **Exemplo de Árvore de derivação**

#### **play [[the [really awesome]] song] {SONG NAME} from [[the] {ALBUM TYPE (album, [blu-ray] disc, great vinyl [record])} called] {ALBUM}**

```
<sentence>
<sentence> <sentence>
<term> <sentence>
<string> <sentence>
play <sentence>
play <sentence> <sentence>
play [<optional>] <sentence>
play [<optional> <optional>] <sentence>
play [[<optional>] <optional>] <sentence>
play [[<optional> <optional>] <optional>] <sentence>
play [[<term> <optional>] <optional>] <sentence>
play [[<string> <optional>] <optional>] <sentence>
play [[the <optional>] <optional>] <sentence>
play [[the [<optional>]] <optional>] <sentence>
play [[the [<optional> <optional>]] <optional>] <sentence>
play [[the [<term> <optional>]] <optional>] <sentence>
play [[the [<string> <optional>]] <optional>] <sentence>
play [[the [really <optional>]] <optional>] <sentence>
play [[the [really <term>]] <optional>] <sentence>
play [[the [really <string>]] <optional>] <sentence>
play [[the [really awesome]] <optional>] <sentence>
play [[the [really awesome]] <term>] <sentence>
play [[the [really awesome]] <string>] <sentence>
play [[the [really awesome]] song] <sentence>
play [[the [really awesome]] song] <sentence> <sentence>
play [[the [really awesome]] song] {<variable>} <sentence>
play [[the [really awesome]] song] {<string> <string>} <sentence>
play [[the [really awesome]] song] {SONG <string>} <sentence>
play [[the [really awesome]] song] {SONG NAME} <sentence>
play [[the [really awesome]] song] {SONG NAME} <sentence> <sentence>
play [[the [really awesome]] song] {SONG NAME} <term> <sentence>
play [[the [really awesome]] song] {SONG NAME} <string> <sentence>
play [[the [really awesome]] song] {SONG NAME} from <sentence>
play [[the [really awesome]] song] {SONG NAME} from <sentence> <sentence>
play [[the [really awesome]] song] {SONG NAME} from [<optional>] <sentence>
play [[the [really awesome]] song] {SONG NAME} from [<optional> <optional>] <sentence>
play [[the [really awesome]] song] {SONG NAME} from [[<optional>] <optional>] <sentence>
play [[the [really awesome]] song] {SONG NAME} from [[<term>] <optional>] <sentence>
play [[the [really awesome]] song] {SONG NAME} from [[<string>] <optional>] <sentence>
play [[the [really awesome]] song] {SONG NAME} from [[the] <optional>] <sentence>
play [[the [really awesome]] song] {SONG NAME} from [[the] <optional> <optional>] <sentence>
play [[the [really awesome]] song] {SONG NAME} from [[the] {<variable>} <optional>] <sentence>
play [[the [really awesome]] song] {SONG NAME} from [[the] {<string> <string> (<list>)} <optional>] <sentence>
play [[the [really awesome]] song] {SONG NAME} from [[the] {ALBUM <string> (<list>)} <optional>] <sentence>
play [[the [really awesome]] song] {SONG NAME} from [[the] {ALBUM TYPE (<list>)} <optional>] <sentence>
play [[the [really awesome]] song] {SONG NAME} from [[the] {ALBUM TYPE (<item>, <list>)} <optional>] <sentence>
play [[the [really awesome]] song] {SONG NAME} from [[the] {ALBUM TYPE (<term>, <list>)} <optional>] <sentence>
play [[the [really awesome]] song] {SONG NAME} from [[the] {ALBUM TYPE (<string>, <list>)} <optional>] <sentence>
play [[the [really awesome]] song] {SONG NAME} from [[the] {ALBUM TYPE (album, <list>)} <optional>] <sentence>
play [[the [really awesome]] song] {SONG NAME} from [[the] {ALBUM TYPE (album, <item>, <list>)} <optional>] <sentence>
play [[the [really awesome]] song] {SONG NAME} from [[the] {ALBUM TYPE (album, <item> <item>, <list>)} <optional>] <sentence>
play [[the [really awesome]] song] {SONG NAME} from [[the] {ALBUM TYPE (album, [<optional>] <item>, <list>)} <optional>] <sentence>
play [[the [really awesome]] song] {SONG NAME} from [[the] {ALBUM TYPE (album, [<term>] <item>, <list>)} <optional>] <sentence>
play [[the [really awesome]] song] {SONG NAME} from [[the] {ALBUM TYPE (album, [<string>] <item>, <list>)} <optional>] <sentence>
play [[the [really awesome]] song] {SONG NAME} from [[the] {ALBUM TYPE (album, [blu-ray] <item>, <list>)} <optional>] <sentence>
play [[the [really awesome]] song] {SONG NAME} from [[the] {ALBUM TYPE (album, [blu-ray] <term>, <list>)} <optional>] <sentence>
play [[the [really awesome]] song] {SONG NAME} from [[the] {ALBUM TYPE (album, [blu-ray] <string>, <list>)} <optional>] <sentence>
play [[the [really awesome]] song] {SONG NAME} from [[the] {ALBUM TYPE (album, [blu-ray] disc, <list>)} <optional>] <sentence>
play [[the [really awesome]] song] {SONG NAME} from [[the] {ALBUM TYPE (album, [blu-ray] disc, <item>)} <optional>] <sentence>
play [[the [really awesome]] song] {SONG NAME} from [[the] {ALBUM TYPE (album, [blu-ray] disc, <item> <item>)} <optional>] <sentence>
play [[the [really awesome]] song] {SONG NAME} from [[the] {ALBUM TYPE (album, [blu-ray] disc, <term> <item>)} <optional>] <sentence>
play [[the [really awesome]] song] {SONG NAME} from [[the] {ALBUM TYPE (album, [blu-ray] disc, <string> <item>)} <optional>] <sentence>
play [[the [really awesome]] song] {SONG NAME} from [[the] {ALBUM TYPE (album, [blu-ray] disc, great <item>)} <optional>] <sentence>
play [[the [really awesome]] song] {SONG NAME} from [[the] {ALBUM TYPE (album, [blu-ray] disc, great <item> <item>)} <optional>] <sentence>
play [[the [really awesome]] song] {SONG NAME} from [[the] {ALBUM TYPE (album, [blu-ray] disc, great <term> <item>)} <optional>] <sentence>
play [[the [really awesome]] song] {SONG NAME} from [[the] {ALBUM TYPE (album, [blu-ray] disc, great <string> <item>)} <optional>] <sentence>
play [[the [really awesome]] song] {SONG NAME} from [[the] {ALBUM TYPE (album, [blu-ray] disc, great vinyl <item>)} <optional>] <sentence>
play [[the [really awesome]] song] {SONG NAME} from [[the] {ALBUM TYPE (album, [blu-ray] disc, great vinyl [<optional>])} <optional>] <sentence>
play [[the [really awesome]] song] {SONG NAME} from [[the] {ALBUM TYPE (album, [blu-ray] disc, great vinyl [<term>])} <optional>] <sentence>
play [[the [really awesome]] song] {SONG NAME} from [[the] {ALBUM TYPE (album, [blu-ray] disc, great vinyl [<string>])} <optional>] <sentence>
play [[the [really awesome]] song] {SONG NAME} from [[the] {ALBUM TYPE (album, [blu-ray] disc, great vinyl [record])} <optional>] <sentence>
play [[the [really awesome]] song] {SONG NAME} from [[the] {ALBUM TYPE (album, [blu-ray] disc, great vinyl [record])} <term>] <sentence>
play [[the [really awesome]] song] {SONG NAME} from [[the] {ALBUM TYPE (album, [blu-ray] disc, great vinyl [record])} <string>] <sentence>
play [[the [really awesome]] song] {SONG NAME} from [[the] {ALBUM TYPE (album, [blu-ray] disc, great vinyl [record])} called] <sentence>
play [[the [really awesome]] song] {SONG NAME} from [[the] {ALBUM TYPE (album, [blu-ray] disc, great vinyl [record])} called] {<variable>}
play [[the [really awesome]] song] {SONG NAME} from [[the] {ALBUM TYPE (album, [blu-ray] disc, great vinyl [record])} called] {<string>}
play [[the [really awesome]] song] {SONG NAME} from [[the] {ALBUM TYPE (album, [blu-ray] disc, great vinyl [record])} called] {ALBUM}
```
