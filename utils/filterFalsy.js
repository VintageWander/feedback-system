// This function filters out falsy attributes from an object
// Which are ones that are null, undefined or blank strings
const filterFalsey = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([_, v]) => v !== null && v !== undefined && v !== NaN && v !== ""
    )
  );
};
module.exports = filterFalsey;
