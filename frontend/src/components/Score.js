import { useParams } from "react-router-dom";
import useGetDataOnMount from "../hooks/useGetData";
import tw from "twin.macro";
import "styled-components/macro";
const Score = () => {
  const { weekNumber } = useParams();
  const getScoreTotals = (scores) => {
    const tribes = { N: "Naumkeag", T: "Tahattawan" };
    const scoreSums = scores.reduce(
      (acc, cv) => {
        console.log(acc);
        acc[tribes[cv.awardedTo]] += cv.points;
        return acc;
      },
      { Naumkeag: 0, Tahattawan: 0 }
    );
    return scoreSums;
  };
  const [scores] = useGetDataOnMount({
    url: `/api/scores?week=${weekNumber}`,
    initialState: null,
    runOn: [weekNumber],
    beforeSet: getScoreTotals,
  });
  const renderScores = (scores) => {
    const scoresArray = [
      { team: "Naumkeag", sum: scores.Naumkeag },
      { team: "Tahattawan", sum: scores.Tahattawan },
    ];
    scoresArray.sort((a, b) => b.sum - a.sum);
    return (
      <div tw="flex flex-col gap-4">
        {scoresArray.map((score) => (
          <div tw="flex p-2 items-baseline bg-green-500">
            <h2 tw="font-bold text-4xl md:text-6xl ">{score.team}s</h2>
            <div tw="flex-grow bg-green-300 p-2 shadow rounded mx-4 text-right">
              <span tw="text-3xl md:text-6xl font-bold ">
              {score.sum}
              </span>
          </div>
          </div>
        ))}
      </div>
    );
  };
  return <><h2 tw="text-2xl md:text-5xl mb-3">Week {weekNumber} Scores:</h2>{scores && renderScores(scores)}</>;
};
export default Score;
