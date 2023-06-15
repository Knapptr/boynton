module.exports = (cabinA, cabinB) => {
  const numberNameA = Number.parseInt(cabinA.name);
  const numberNameB = Number.parseInt(cabinB.name);
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
