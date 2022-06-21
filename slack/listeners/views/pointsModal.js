const Score = require("../../../models/score");
const { getWeek } = require("../../../utils/getDates");
const channelToPostCongratulations =
  process.env.GENERAL_CHANNEL_ID || process.env.AWARDS_CHANNEL_ID;

const tribes = { N: "Naumkeag", T: "Tahattawan" };

const submitPoints = async ({ ack, view, client }) => {
  await ack();
  try {
    let weekNumber = getWeek();
    //This should be removed for production
    if (weekNumber === "non") {
      weekNumber = 1;
    }
    //^^^^This should be removed for production
    const awardedTo = view.state.values.tribe.select.selected_option.value;
    const awardedFor = view.state.values.awardedFor.text.value;
    const points = view.state.values.points.text.value;
    const insertedScore = await Score.create({
      awardedTo,
      points,
      awardedFor,
      weekNumber,
    });
    let scores = await Score.getAll();
    scores = scores.filter((s) => s.weekNumber === weekNumber);
    const sums = scores.reduce(
      (acc, cv) => {
        if (cv.weekNumber === weekNumber) {
          acc[tribes[cv.awardedTo]] += cv.points;
        }
        return acc;
      },
      { Naumkeag: 0, Tahattawan: 0 }
    );
    client.chat.postMessage({
      channel: channelToPostCongratulations,
      text: `${tribes[insertedScore.awardedTo]}s Just scored ${
        insertedScore.points
      } point(s) for *${insertedScore.awardedFor}* \n That brings the week ${weekNumber} score to:\n *Naumkeags*: ${
        sums.Naumkeag
      }\n *Tahattawans*: ${sums.Tahattawan}`,
    });
  } catch (e) {
    console.log(e);
  }
};
module.exports = submitPoints;
