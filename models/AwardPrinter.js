const { default: Automizer, modify } = require("pptx-automizer/dist");
const { AWARDS, getAwardTemplate } = require("../utils/awardDefinitions");

const DEFAULT_CONFIG = {
    templateDir: "templates",
    outputDir: "output",
    removeExistingSlides: true,
}

class AwardPrinter {
  constructor(automizerConfig = DEFAULT_CONFIG) {
    const automizer = new Automizer(automizerConfig);
    automizer.loadRoot("genericAward_template.pptx");
    AWARDS.forEach((award) => {
      automizer.load(award.template, award.awardType);
    });
    this.pres = automizer;
  }

  async stream(awardsByGroup) {
    Object.keys(awardsByGroup).forEach((awardType) => {
      awardsByGroup[awardType].forEach((award) => {
        this.pres.addSlide(getAwardTemplate(awardType), 1, (slide) => {
          slide.modifyElement(
            "awardData",
            modify.replaceText(
              [
                { replace: "awardFor", by: { text: award.reason } },
                { replace: "firstName", by: { text: award.camperFirstName } },
                { replace: "lastName", by: { text: award.camperLastName } },
                { replace: "weekTitle", by: { text: award.weekTitle } },
              ],
              { openingTag: "{", closingTag: "}" }
            )
          );
        });
      });
    });
      console.log({pres:this.pres})
      const stream = await this.pres.stream({compressionOptions:{level:9}})
      console.log({stream})
      return stream
  }
}

module.exports = AwardPrinter
