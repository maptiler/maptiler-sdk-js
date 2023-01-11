/**
 * This script takes a text file as input and a text file as output.
 * The input text is supposed to contain occurences of filepath between
 * square brackets such as "foo bar [some/file/path.txt] foofoo barbar".
 * 
 * This script replaces this pattern by the actual content of the file
 * between square brackets.
 * 
 * The main purpose is to inject actual SVG string (URL encoded) into CSS
 * for `background-image` properties. If need be, we could also apply the
 * same logic for more file types such as png with base64 string.
 * 
 * This script is used by rollup.config.js , so check there to see it in
 * application.
 */

import fs from 'fs';
import { exit } from 'process';

if (process.argv.length !== 4) {
  console.error("This script takes 2 arguments: input_filepath.txt output_filpath.txt")
  exit(1);
}

let text = fs.readFileSync(process.argv[2], "utf8");

// replace based on file extension
const transforms = {
  svg: (filepath) => {
    const fileText = encodeURIComponent(fs.readFileSync(filepath, "utf8"));
    return `"data:image/svg+xml;charset=utf-8,${fileText}"`;
  }
}

// Find all occurrences of file paths between square brackets
let filePaths = text.match(/\[(.*?)\]/g);

// Replace all occurrences of file paths with the actual text contained in the files
filePaths.forEach(filePath => {
  let filepath = filePath.slice(1, -1); // remove the square brackets
  const extension = filepath.split(".").pop().toLowerCase();

  if (!(extension in transforms)) {
    return;
  }

  text = text.replace(filePath, transforms[extension](filepath))
});

// console.log(text);
fs.writeFileSync(process.argv[3], text);