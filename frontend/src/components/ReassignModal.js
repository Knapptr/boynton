import tw from 'twin.macro';
import 'styled-components/macro'
import {useState} from 'react'
import {PopOut} from './styled'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faCircleXmark} from '@fortawesome/free-regular-svg-icons'

const ReassignModal = ({
  setDisplayModal,
  selectedCampers,
  camperSelection,
  updatePeriod,
  period,
}) => {
  const [reassignmentOption, setReassignmentOption] = useState("default");
  const reassignCampers = async () => {
    const activity = period.activities.find(
      (a) => a.id === Number.parseInt(reassignmentOption)
    );
    await Promise.all(
      selectedCampers.map((c) => camperSelection.reassign(c, activity))
    );
    updatePeriod();
    camperSelection.clear();
    setDisplayModal(false);
  };
  return (
    <PopOut
      onClick={() => {
        setDisplayModal(false);
      }}
      shouldDisplay={true}
    >
      <div
        tw="bg-coolGray-50 rounded pb-8 relative shadow-2xl w-full md:w-1/2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setDisplayModal(false)}
          tw="top-0 right-1 absolute"
        >
          <FontAwesomeIcon size="lg"icon={faCircleXmark}/>
        </button>
        <h2 tw="bg-orange-400 p-2 rounded-t mb-2">
          Reassign {selectedCampers.length} camper(s)?
        </h2>
        <div tw="flex flex-col justify-center items-center">
          <ul tw="flex flex-col gap-1 my-2">
            {selectedCampers.map((c,cIndex) => (
              <li key={`reassignmentCamper-${cIndex}`} tw="bg-green-300 shadow border">
                {c.firstName} {c.lastName}
              </li>
            ))}
          </ul>
          <label htmlFor="reassignTo">Reassign To:</label>
          <select
            tw="text-xl"
            name="reassignTo"
            id="reassignTo"
            //defaultValue={"default"}
            value={reassignmentOption}
            onChange={(e) => {
              setReassignmentOption(e.target.value);
            }}
          >
            <option disabled value={"default"}>
              Select an option
            </option>
            {period.activities.map((a,aIndex) => (
              <option key={`reassign-option-${aIndex}`}value={a.id}>{a.name}</option>
            ))}
          </select>
          <button
            tw="bg-green-600 px-3 py-2 rounded shadow mb-2 mt-6"
            onClick={async () => reassignCampers()}
          >
            Reassign
          </button>
        </div>
      </div>
    </PopOut>
  );
};

export default ReassignModal
