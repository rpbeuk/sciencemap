import XLSX from 'xlsx';

const filePath = process.argv[2];
const wb = XLSX.readFile(filePath);
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws);

console.log('Sheet name:', wb.SheetNames[0]);
console.log('Total rows:', data.length);
console.log('Columns:', Object.keys(data[0] || {}));
console.log('\nFirst row:');
console.log(JSON.stringify(data[0], null, 2));
