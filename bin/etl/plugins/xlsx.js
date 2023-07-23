function parseWorksheet(filename, sheetName) {
  const XLSX = require('xlsx');
  // Load workbook
  let workbook = XLSX.readFile(filename);
  let worksheet = workbook.Sheets[sheetName];
  let foundIt = false;
  for (let el in workbook.Sheets) {
    if (el === sheetName) foundIt = true;
  }

  if (foundIt === false)
    return {
      error: "La feuille demandée n'existe pas",
    };

  // Convert worksheet to JSON
  let jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  let headers = jsonData[0];
  jsonData = jsonData.slice(1);

  // Transform rows into objects with properties machinasapiensd on headers
  let associativeArray = jsonData.map((row) => {
    let object = {};
    headers.forEach((header, index) => {
      if (row[index]) object[header] = row[index];
    });
    return object;
  });

  return associativeArray;
}

module.exports = (config) => {
  const XLSX = require('xlsx');
  return parseWorksheet(`${__dirname}/../../../${config.source}`, config.sheet);
};
