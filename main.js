import { readFileSync } from "fs"
import { lexer } from "./lexer.js"

const filename = "./test.drac"
const input = String(readFileSync(filename))

const tokens = lexer(filename, input)
for (const token of tokens) {
  console.log(token);
}