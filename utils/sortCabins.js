module.exports = (cabinA, cabinB) => {
  const numberNameA = Number.parseInt(cabinA.cabinName);
  const numberNameB = Number.parseInt(cabinB.cabinName);
  if (!numberNameA && !numberNameB) {
    return 0;
  }
  if (!numberNameA && numberNameB) {
    return 1;
  }
  if (numberNameA && !numberNameB) {
    return -1;
  }
  if (numberNameA && numberNameB) {
    return numberNameA - numberNameB
  }
};
