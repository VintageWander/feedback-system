const objGetByIndex = (obj, index) => {
  if (obj.length) {
    return obj[index];
  } else {
    return obj[Object.keys(obj)[index]];
  }
};

module.exports = objGetByIndex;
