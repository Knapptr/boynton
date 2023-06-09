import tw, { styled } from "twin.macro";
import "styled-components/macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleDot,
  faCircle,
  faSquare,
  faSquareCheck,
} from "@fortawesome/free-regular-svg-icons";
import { StaffListing } from "./styled";

const AttendantWrapper = styled.li(({ isChecked, isSelected }) => [
  tw`bg-yellow-200 even:bg-yellow-300 font-bold py-3 select-none transition-colors border border-white`,
  isChecked && tw`bg-green-300 even:bg-green-400`,
  isSelected && tw`z-0 ring ring-inset ring-orange-500`,
  isSelected && isChecked && tw`bg-green-600 even:bg-green-600`,
  isSelected && !isChecked && tw`bg-yellow-600 even:bg-yellow-600`,
]);

const AttendanceName = tw.div`flex justify-start flex-grow px-4`;

const AttendanceButton = styled.button(({ isPresent }) => [tw`px-2 ml-auto`]);

export const AttendanceSummary = styled.div(({ allHere }) => [
  tw`z-50 text-sm py-px font-bold px-2 bg-red-500 text-white transition-colors rounded flex items-center justify-center`,
  allHere && tw`bg-green-500`,
]);

const CamperAttendant = ({
  camperIndex,
  camper,
  activity,
  toggleIsPresent,
  camperSelection,
}) => {
  const assignHere = async () => {
    toggleIsPresent(activity.sessionId, camper.sessionId);
    const options = {
      method: "PUT",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${localStorage.getItem("bearerToken")}`,
      },
      body: JSON.stringify({ isPresent: !camper.isPresent }),
    };
    await fetch(`/api/camper-activities/${camper.activityId}/attendance`, options);
  };

  return (
    <AttendantWrapper
      isChecked={camper.isPresent}
      isSelected={camperSelection.isSelected(camper)}
    >
      <div tw="flex mx-auto px-2 md:px-32">
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
            {camperSelection.isSelected(camper) ? (
              <FontAwesomeIcon icon={faCircleDot} />
            ) : (
              <FontAwesomeIcon icon={faCircle} />
            )}
          </button>
        </div>
        <AttendanceName isPresent={camper.isPresent}>
          <p>
            {camper.firstName} {camper.lastName}
          </p>
          <span tw="font-light ml-3">{camper.cabinName}</span>
        </AttendanceName>
        <AttendanceButton isPresent={camper.isPresent} onClick={assignHere}>
          {camper.isPresent && (
            <FontAwesomeIcon size="xl" icon={faSquareCheck} />
          )}
          {!camper.isPresent && <FontAwesomeIcon size="xl" icon={faSquare} />}
        </AttendanceButton>
      </div>
    </AttendantWrapper>
  );
};

const ActivityAttendance = ({
  activity,
  activityIndex,
  toggleHere,
  camperSelection,
}) => {
  const getUnaccountedFor = () => {
    const unaccounted = activity.campers.filter(
      (camper) => camper.isPresent === false || camper.activityName === null
    );
    return unaccounted.length;
  };
  return (
    <>
      <div tw="relative ">
        <header tw="mb-4 bg-lightBlue-500 sticky top-16  justify-center py-2 px-3">
          <div id="top-row" tw="flex" >
            <div tw="py-3 px-2 text-xl font-bold text-white w-1/2 sm:w-2/3 ">
              <h2 tw="">
                {activity.name}
                <span tw="text-gray-800 ml-3 font-thin">
                  {activity.campers.length}
                </span>
              </h2>
            </div>
            <AttendanceSummary allHere={getUnaccountedFor() === 0}>
              {getUnaccountedFor() ? (
                <span>{getUnaccountedFor()} unaccounted</span>
              ) : (
                <span>All Here!</span>
              )}
            </AttendanceSummary>
          </div>
          <div id="bottom-row">
            <ul tw="flex flex-col sm:flex-row text-black font-normal gap-3">{activity.staff.map(staffer => <StaffListing staffer={staffer}>{staffer.firstName}</StaffListing>)}</ul>
          </div>
        </header>
        <ul tw="w-11/12 mx-auto my-3">
          {activity.campers.length === 0 ? (
            <li>no campers</li>
          ) : (
            [...activity.campers]
              .sort((camper1, camper2) => camper1.lastName.localeCompare(camper2.lastName)
              )
              .map((camper, camperIndex) => (
                <CamperAttendant
                  camperSelection={camperSelection}
                  key={`camper-${activity.name}-${camper.sessionId}`}
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
