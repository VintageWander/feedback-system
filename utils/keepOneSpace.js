const keepOneSpace = (str) => {
  // this code allows one white space per word
  return str.replace(/\s+/g, " ").trim();
};

module.exports = keepOneSpace;
