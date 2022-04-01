const filterSpecialChar = (str) => {
  return str.replace(/[^\w\s]/gi, "").toLowerCase();
};

module.exports = filterSpecialChar;
