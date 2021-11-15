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
    return { type: "lit_str" };
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
      return { type: "lit_int", buffer };
    }
    return null;
  }

  function operator() {
    if (chr === "=") {
      next();
      return { type: "=" };
    }
    if (chr === "+") {
      next();
      return { type: "+" };
    }
    if (chr === "-") {
      next();
      if(chr === "-") {
        next();
        return singleInlineComment();
      }
      return { type: "-" };
    }
    if (chr === "*") {
      next();
      return { type: "*" };
    }
    if (chr === "%") {
      next();
      return { type: "%" };
    }
    if (chr === "=") {
      next();
      return { type: "=" };
    }
    if (chr === "/") {
      next();
      return { type: "/" };
    }
    if (chr === ">") {
      next();
      if(chr === "=") {
        next();
        return {type: ">="};
      }
      return { type: ">" };
    }
    if (chr === "<") {
      next();
      if(chr === "=") {
        next();
        return {type: "<="};
      }
      if(chr === ">") {
        next();
        return {type: "<>"};
      }
      return { type: "<" };
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
    return true;
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
    return true;
  }

  const KEYWORDS = {
    break: "break",
    and: "and",
    else: "else",
    or: "ar",
    return: "return",
    dec: "dec",
    if: "if",
    do: "do",
    inc: "inc",
    var: "var",
    elif: "elif",
    not: "not",
    while: "while",
    true: "true",
    false: "false",
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
    return { type: "id", value: buffer };
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
    return { type: ";" };
  }

  function comma() {
    if (chr !== ",") {
      return null;
    }
    next();
    return { type: "," };
  }

  function parents() {
    if (chr === "(") {
      next();
      if(chr === "*"){
        next();
        return endOfComment();
      }
      return { type: "(" };
    }
    if (chr === ")") {
      next();
      return { type: ")" };
    }
    if (chr === "{") {
      next();
      return { type: "{" };
    }
    if (chr === "}") {
      next();
      return { type: "}" };
    }
    if (chr === "[") {
      next();
      return { type: "[" };
    }
    if (chr === "]") {
      next();
      return { type: "]" };
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