const getDate = () => {
  return new Date().toLocaleString("en-GB", { hour12: true });
};

module.exports = getDate;
