const transformMap = (input, map) => {
  let output = {};

  for (let key in input) {
    if (!input.hasOwnProperty(key)) continue;

    if (map.hasOwnProperty(key)) {
      const mapping = map[key];

      if (typeof mapping === 'object') {
        const newKey = mapping.name || key;
        let value = input[key];

        // Check if a render function is provided and if so, use it to transform the value
        if (mapping.render && typeof mapping.render === 'function') {
          value = mapping.render(value);
          switch (mapping.type) {
            case 'string':
              value = value;
              break;
            case 'integer':
              value = parseInt(value);
              break;
            case 'int':
              value = parseInt(value);
              break;
            case 'double':
              value = parseFloat(value);
              break;
            case 'date':
              value = new Date(value);
              break;
            case 'timestamp':
              value = new Date(value).getTime();
              break;
            case 'json':
              JSON.stringify(value);
              break;
            default:
              value = value;
              break;
          }
          output[newKey] = value;
        } else {
          output[newKey] = value;
        }
      } else {
        output[mapping] = input[key];
      }
    } else {
      output[key] = input[key];
    }
  }

  return output;
};
const mapping = (inputArray, map) => {
  inputArray = JSON.parse(JSON.stringify(inputArray));
  return inputArray.map((input) => transformMap(input, map));
};

module.exports = {
  mapping,
};
