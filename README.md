Manuel Salvador-A01422267 </br>
José Antonio Lome-A01422195 </br>

# DracLanguage

## Este proyecto tiene como objetivo crear un análisis léxico, sintáctico (con sus respectivos árboles) y semántico para el lenaguaje Drac.

-Gramática léxica de Drac:
-Tokens
-There are five kinds of tokens: identifiers, keywords, literals, operators, and other separators. Spaces, tabulators, newlines, and comments (collectively, “white space”) are used as delimiters between tokens, but are otherwise ignored.

If the input stream has been separated into tokens up to a given character, the next token is the longest string of characters that could constitute a token.

-Comments
-Single line comments start with two hyphens (--) and conclude at the end of the line.
-Multi-line comments start with a left parentheses followed by an asterisk [(*] and end with an asterisk followed by a right parentheses [*)]
-Identifiers
-Keywords


() | ()|()
------------- | ------------- | -------------
and | else | or |
break | false | return |
dec | if | true |
do | inc | var |
elif | not | while |

-Literals
