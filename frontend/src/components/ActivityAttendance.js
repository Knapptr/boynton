import tw , {styled} from 'twin.macro';
import 'styled-components/macro';

const AttendantWrapper = styled.li(({ isChecked, isSelected }) => [
  tw`bg-yellow-300 font-bold py-3 select-none transition-colors border border-white`,
  isChecked && tw`bg-green-400`,
  isSelected &&  tw`z-0 ring ring-inset ring-orange-500`,
  isSelected && isChecked && tw`bg-green-600`,
  isSelected && !isChecked && tw`bg-yellow-600`
]);

const AttendanceName = styled.p(({ isPresent }) => [
  isPresent && tw`line-through`,
]);

const AttendanceButton = styled.button(({ isPresent }) => [
  tw`px-2 border shadow-xl bg-gray-200 ml-auto rounded-lg`,
  isPresent && tw`no-underline`,
]);

const AttendanceSummary = styled.div(({ allHere }) => [
  tw`z-50 text-sm py-px font-bold px-2 bg-red-500 text-white transition-colors rounded flex items-center w-2/5 justify-center`,
  allHere && tw`bg-green-500`,
]);

const CamperAttendant = ({
  camperIndex,
  camper,
  activity,
  toggleIsPresent,
  camperSelection,
}) => {
  return (
    <AttendantWrapper
      isChecked={camper.isPresent}
      isSelected={camperSelection.isSelected(camper)}
    >
      <div tw="flex mx-auto px-8 md:px-32">
        <div tw="mr-auto">
          <button
            onClick={() => {
              if (camperSelection.isSelected(camper)) {
                camperSelection.deselect(camper);
                return;
              }
              camperSelection.select(camper);
            }}
          >
            {camperSelection.isSelected(camper) ? "Deselect" : "Select"}
          </button>
        </div>
        <AttendanceName isPresent={camper.isPresent}>
          {camper.firstName} {camper.lastName}
        </AttendanceName>
        <AttendanceButton
          isPresent={camper.isPresent}
          onClick={async () => {
            toggleIsPresent(activity.id, camperIndex);
            const options = {
              method: "PUT",
              headers: {
                "content-type": "application/json",
                authorization: `Bearer ${localStorage.getItem("bearerToken")}`,
              },
              body: JSON.stringify({ isPresent: !camper.isPresent }),
            };
            await fetch(
              `/api/activities/${activity.id}/campers/${camper.id}`,
              options
            );
          }}
        >
          {!camper.isPresent && "Not"} Here
        </AttendanceButton>
      </div>
    </AttendantWrapper>
  );
};

const ActivityAttendance = ({ activity, activityIndex, toggleHere, camperSelection }) => {
  const getUnaccountedFor = () => {
    const unaccounted = activity.campers.filter(
      (camper) => camper.isPresent === false
    );
    return unaccounted.length;
  };
  return (
    <>
      <div tw="relative ">
        <header tw="mb-4 bg-lightBlue-500 sticky top-0 flex justify-center py-2 px-3">
          <h2 tw="py-3 px-2 text-xl font-bold text-white w-1/2 sm:w-2/3 ">
            {activity.name}
            <span tw="text-gray-800 ml-3 font-thin">{activity.campers.length}</span>
          </h2>
          <AttendanceSummary allHere={getUnaccountedFor() === 0}>
            {getUnaccountedFor() ? (
              <span>{getUnaccountedFor()} unaccounted</span>
            ) : (
              <span>All Here!</span>
            )}
          </AttendanceSummary>
        </header>
        <ul tw="w-11/12 mx-auto my-3">
          {activity.campers.length === 0 ? (
            <li>no campers</li>
          ) : (
            activity.campers
            .sort((camper1, camper2) => {
              return camper1.lastName > camper2.lastName ? 1 : -1;
            })
            .map((camper, camperIndex) => (
              <CamperAttendant
                camperSelection={camperSelection}
                key={`camper-${activity.name}-${camperIndex}`}
                toggleIsPresent={toggleHere}
                camperIndex={camperIndex}
                camper={camper}
                activityIndex={activityIndex}
                activity={activity}
              ></CamperAttendant>
            ))
          )}
        </ul>
      </div>
    </>
  );
};

export default ActivityAttendance;
