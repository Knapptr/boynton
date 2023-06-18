const AWARDS = [
  { awardType: "GENERIC", template: "genericAward_template.pptx" },
  {
    awardType: "Challenge Activities",
    template: "challengeActivitiesAward_template.pptx",
  },
  // {awardType: "Waterfront", template: "waterfrontAward_template.pptx"},
];
const getAwardTemplate = (programAreaString) => {
  const templates = ["Challenge Activities"];
  if (templates.includes(programAreaString)) {
    return programAreaString;
  } else {
    return "GENERIC";
  }
};

module.exports = {AWARDS,getAwardTemplate}
