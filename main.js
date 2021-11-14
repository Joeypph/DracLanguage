import { readFileSync, writeFile } from "fs"
import { lexer } from "./lexer.js"

const filename = "./test.drac"
const input = String(readFileSync(filename))

const tokens = lexer(filename, input)

let result

for (const token of tokens) {
  console.log(token)
  result += JSON.stringify(token)
}

// Write data in 'Output.txt' . 
writeFile('output.txt', result, (err) => { 
      
  // In case of a error throw err. 
  if (err) throw err; 
}) 