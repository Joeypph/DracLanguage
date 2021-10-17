function isNumeric(c) {
  return /^\d+$/.test(c);
}

function isLetter(c) {
  return ("a" <= c && c <= "z") || ("A" <= c && c <= "Z");
}

export function* lexer(filename, str) {
  let line = 1;
  let column = 1;
  let cursor = 0;
  let chr = str[cursor];

  function next() {
    cursor++;
    chr = str[cursor];
    column++;
  }

  function newLine() {
    line++;
    column = 1;
  }

  function stringOfType(delimiter) {
    if (chr !== delimiter) {
      return null;
    }
    next();
    while (chr !== delimiter) {
      next();
    }

    // Busca el ultimo delimitador para ver si es una cdena literal
    next();
    return { type: "String" };
  }

  function string() {
    return stringOfType('"') || stringOfType("'");
  }

  function number() {
    let buffer = "";
    while (isNumeric(chr)) {
      buffer += chr;
      next();
    }
    if (buffer.length >= 1) {
      return { type: "Numeric", buffer };
    }
    return null;
  }
  function operator() {
    if (chr === "="||chr===":") {
      next();
      return { type: "EqualToken" };
    }
    
    if (chr === "+") {
      next();
      return { type: "PlusToken" };
    }

    if (chr === "-") {
      next();
      if(chr === "-") {
        next();
        return singleInlineComment();
      }
      return { type: "SubstractionToken" };
    }

    if (chr === "*") {
      next();
      return { type: "MulToken" };
    }

    if (chr === "=") {
      next();
      return { type: "AllocationToken" };
    }

    if (chr === "/") {
      next();
      return { type: "DivToken" };
    }

    return null;
  }

  function singleInlineComment() {
    for (;;) {
      if (chr === "\r" || chr === "\n") {
        newLine();
        next();
        break;
      }

      if (chr === undefined) {
        break;
      }

      next();
    }

    return { type: "CommentToken" };
  }

  function endOfComment() {
    for (;;) {
      if (chr === "*") {
        operator();
        next();
        break;
      }

      if (chr === undefined) {
        break;
      }

      next();
    }

    return { type: "CommentToken" };
  }

  const KEYWORDS = {
    break: "Break",
    and: "And",
    else: "Else",
    or: "Or",
    false: "False",
    return: "Return",
    dec: "Dec",
    if: "If",
    true: "True",
    do: "Do",
    inc: "Inc",
    var: "Var",
    elif: "Elif",
    not: "Not",
    while: "While",
  };

  function id() {
    let buffer = "";
    if (!isLetter(chr)) {
      return null;
    }
    buffer += chr;
    next();

    while (isLetter(chr) || isNumeric(chr) || chr === "_") {
      buffer += chr;
      next();
    }

    const type = KEYWORDS[buffer];
    if (type) {
      return { type };
    }

    return { type: "Id", value: buffer };

    return null;
  }

  function whiteSpace() {
    if (chr === " " || chr === "\t") {
      next();
    } else {
      return null;
    }

    while (chr === " " || chr === "\t") {
      next();
    }

    return true;
  }

  function semicolon() {
    if (chr !== ";") {
      return null;
    }

    next();

    return { type: "SemicolonToken" };
  }

  function comma() {
    if (chr !== ",") {
      return null;
    }

    next();

    return { type: "CommaToken" };
  }
  function parents() {
    if (chr === "(") {
      next();
      if(chr === "*"){
        next();
        return endOfComment();
      }
      return { type: "OpenParent" };
    }

    if (chr === ")") {
      next();
      return { type: "CloseParent" };
    }

    if (chr === "{") {
      next();
      return { type: "OpenCurly" };
    }

    if (chr === "}") {
      next();
      return { type: "CloseCurly" };
    }

    if (chr === "[") {
      next();
      return { type: "OpenBracket" };
    }

    if (chr === "]") {
      next();
      return { type: "CloseBracket" };
    }

    return null;
  }

  function eol() {
    if (chr === "\n" || chr === "\r") {
      next();
      newLine();
    } else {
      return null;
    }

    while (chr === "\n" || chr === "\r") {
      next();
      newLine();
    }

    return true;
  }

  function eof() {
    chr = str[cursor];

    if (chr === undefined) {
      cursor++;
      return { type: "End" };
    }

    return null;
  }

  //version corta de while(true) que no requiere optimización
  for (;;) {
    const token =
      whiteSpace() ||
      operator() ||
      semicolon() ||
      comma() ||
      number() ||
      id() ||
      parents() ||
      string() ||
      eol();

    if (token) {
      if (token === true) {
        continue;
      }

      yield token;

      continue;
    }

    const EndOfFile = eof();
    if (EndOfFile) {
      break;
    }

    throw new SyntaxError(`Caracter no reconocido "${chr}" en ${filename}: ${line}:${column}`);
  }
}