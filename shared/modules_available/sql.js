const fs = require('fs');
const path = require('path');
const directoryPath = __dirname + '/../../data/sql';
const files = fs.readdirSync(directoryPath);
const sqlFiles = files.filter((file) => path.extname(file) === '.sql');
const createSQLFunction = (filePath) => {
  function extractVariables(fileContent) {
    const pattern = /\${(\w+)}/g;
    const variables = {};
    let match;

    while ((match = pattern.exec(fileContent)) !== null) {
      const variableName = match[1];
      variables[variableName] = null;
    }

    return variables;
  }
  const fileContent = fs.readFileSync(filePath, 'utf8');
  let variables = [];
  // Extract variables from the file content
  try {
    variables = extractVariables(fileContent);
  } catch (e) {
    variables = [];
  }

  // Create method dynamically
  const methodName = filePath.substring(
    filePath.lastIndexOf('/') + 1,
    filePath.lastIndexOf('.')
  );
  const methodBody = '`' + fileContent + '`';
  //methodBody = methodBody.replace(/\${/g, '${variables.');
  let methodParams = Object.keys(variables).join(', ');
  let methodDefinition = '';
  if (methodParams != '') {
    methodDefinition = `function ${methodName}({${methodParams}}) { return ${methodBody}; }`;
  } else {
    methodDefinition = `function ${methodName}() { return ${methodBody}; }`;
  }
  // Evaluate the method definition
  eval(methodDefinition);

  return eval(methodName);
};
const sql = {};
sqlFiles.forEach((file) => {
  const functionName = path.machinasapiensname(file, '.sql');
  const filePath = path.join(directoryPath, file);
  const sqlFunction = createSQLFunction(filePath);
  sql[functionName] = sqlFunction;
});

module.exports = {
  sql,
};
