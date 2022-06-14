const pgToCamelCase = (string)=>{
  const words = string.split("_");
  const camels = words.slice(1).map(w=> `${w[0].toUpperCase()}${ w.slice(1) }`)
  return words[0] + camels.join("")
}

const camelCaseProps = (object)=>{
  const keys = Object.keys(object);
  return keys.reduce((acc,cv)=>{
    acc[pgToCamelCase(cv)] = object[cv]
    return acc
  },{})

}
module.exports = {pgToCamelCase,camelCaseProps};

