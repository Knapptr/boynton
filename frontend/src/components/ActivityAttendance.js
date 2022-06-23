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

const SummaryBanner = styled.div(({ allHere }) => [
  tw`z-50 text-sm flex justify-between  py-px font-bold px-2 bg-red-500 text-white transition-colors border border-b-black`,
  allHere && tw`bg-green-500`,
]);

const CamperAttendant = ({
  camperIndex,
  camper,
  activity,
  activityIndex,
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
        <header tw="mb-4 sticky top-0">
          <h2 tw="py-3 bg-lightBlue-500 text-xl font-bold text-white ">
            {activity.name}
          </h2>
          <SummaryBanner allHere={getUnaccountedFor() === 0}>
            <span>{activity.campers.length} campers total</span>
            {getUnaccountedFor() ? (
              <span>{getUnaccountedFor()} unaccounted for</span>
            ) : (
              <span>"All Here!"</span>
            )}
          </SummaryBanner>
        </header>
        <ul tw="w-11/12 mx-auto">
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
