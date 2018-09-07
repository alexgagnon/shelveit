const {promisify} = require('util');
const {readFile, writeFile, unlink} = require('fs');
module.exports = {
  readFileP: promisify(readFile),
  writeFileP: promisify(writeFile),
  unlinkP: promisify(unlink)
};
