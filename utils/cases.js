const pgToCamelCase = (string) => {
  const words = string.split("_");
  const camels = words.slice(1).map(w => `${w[0].toUpperCase()}${w.slice(1)}`)
  return words[0] + camels.join("")
}

/** Turn db props of object from snake case to camelCase 
  * @param {{}} object 
  * @returns {{}} an object */
const camelCaseProps = (object) => {
  const keys = Object.keys(object);
  return keys.reduce((acc, cv) => {
    acc[pgToCamelCase(cv)] = object[cv]
    return acc
  }, {})

}
module.exports = { pgToCamelCase, camelCaseProps };

