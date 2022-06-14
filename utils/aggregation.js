// PICK returns selected properties from an object as a new object
// if mapModel is an array, the returned object will use those property names as keys
// if mapModel is an object, the returned object will return the value of each key, as a new key (denoted by mapModel's prop),
const pick = (obj, mapModel) => {
  const originalKeys = Array.isArray(mapModel)
    ? mapModel
    : Object.keys(mapModel);

  const subObj = originalKeys.reduce((acc, cv) => {
    const key = Array.isArray(mapModel) ? cv : mapModel[cv];
    acc[key] = obj[cv];
    return acc;
  }, {});
  return subObj;
};

//Map to groups aggregates data into objects
// key is the unique identifier to group
// groupAs is the new property name,
//insideProps is an object with keys representing the properties desired to be grouped
// and props representing the name of the property when grouped

const mapToGroups = (array, key, groupAs, insideProps) => {
  const groupedKeys = Object.keys(insideProps);
  const outsideKeys = Object.keys(array[0]).filter(
    (p) => !groupedKeys.includes(p)
  );
  const remapped = array.reduce((acc, cv) => {
    const fromAcc = acc.find((a) => a[key] === cv[key]);
    const insideGroup = pick(cv, insideProps);
    if (fromAcc) {
      fromAcc[groupAs].push(insideGroup);
      return acc;
    }
    const outsideObj = pick(cv, outsideKeys);
    outsideObj[groupAs] = [insideGroup];
    acc.push(outsideObj);
    return acc;
  }, []);

  return remapped;
};

module.exports = { mapToGroups, pick };
