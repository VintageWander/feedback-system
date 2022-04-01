const isInvalidCharacter = (str) => {
  return /[^a-zA-Z0-9\s]/.test(str);
};

module.exports = isInvalidCharacter;
