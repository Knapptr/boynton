const getDayName = (dayNameFromDb) => {
  const dict = {
    "MON": "Monday",
    "TUE": "Tuesday",
    "WED": "Wednesday",
    "THU": "Thursday",
    "FRI": "Friday"

  }
  return dict[dayNameFromDb]
}
export default getDayName;
