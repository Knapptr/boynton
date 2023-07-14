const AWARDS = [
  { awardType: "GENERIC", template: "genericAward_template.pptx" },
  {
    awardType: "Challenge Activities",
    template: "challengeactivities_template.pptx",
  },
  { awardType: "Waterfront", template: "waterfront_template.pptx" },
  {
    awardType: "Creative Arts",
    template: "creativearts_template.pptx",
  },
  {
    awardType: "Archery",
    template: "archery_template.pptx",
  },
  {
    awardType: "Ropes",
    template: "ropes_template.pptx",
  },
  {
    awardType: "Superstar",
    template: "superstar_template.pptx",
  },
  {
    awardType: "Polar Bear Dip",
    template: "pbd_template.pptx",
  },
  {
    awardType: "Clean Cabin",
    template: "cleancabin_template.pptx",
  },
  {
    awardType: "Nature",
    template: "nature_template.pptx",
  },
];
const getAwardTemplate = (programAreaString) => {
  const templates = [
    "Challenge Activities",
    "Waterfront",
    "Creative Arts",
    "Archery",
    "Ropes",
    "Superstar",
    "Polar Bear Dip",
    "Clean Cabin",
    "Nature",
  ];
  if (templates.includes(programAreaString)) {
    return programAreaString;
  } else {
    return "GENERIC";
  }
};

module.exports = { AWARDS, getAwardTemplate };
