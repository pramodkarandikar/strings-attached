const xlsx = require('xlsx');
const path = require('path');

const workbook = xlsx.readFile(path.join(__dirname, 'guitar-chords.xlsx'));
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

console.log("Headers:", data[0]);

const todos = [];
for (let i = 1; i < data.length; i++) {
  const row = data[i];
  if (row && row.length > 0) {
    todos.push(row);
  }
}
console.log("Data:");
console.log(JSON.stringify(todos, null, 2));
