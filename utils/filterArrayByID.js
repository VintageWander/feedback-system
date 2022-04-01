const filterArrayByID = (array, itemID) => {
  return array.filter(
    (element) => element._id.toString() !== itemID.toString()
  );
};

module.exports = filterArrayByID;
