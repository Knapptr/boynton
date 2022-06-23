import tw, { styled } from "twin.macro";
import "styled-components/macro";

const Dialog = styled.div(({ shouldDisplay }) => [
  tw`invisible opacity-0 transition-opacity`,
  shouldDisplay && tw`visible opacity-100`,
]);

const ReassignmentSelectionDialog = ({
  selectedCampers,
  camperSelection,
  setDisplayModal,
}) => {
  return (
    <Dialog
      shouldDisplay={selectedCampers.length > 0}
      tw="fixed bottom-0 w-full left-0 "
    >
      <div tw="bg-coolGray-400 shadow-lg rounded w-full md:w-1/2 mx-auto">
        <h3 tw="bg-coolGray-100 flex px-2 justify-evenly">
          Reassignment
          <span tw=""> {selectedCampers.length} selected</span>
        </h3>
        <div tw="flex justify-around p-4">
          <button tw="bg-red-500 rounded shadow w-1/2 py-2" onClick={camperSelection.clear}>
            Clear
          </button>
          <button
            tw="w-1/2 bg-green-500 rounded shadow py-2"
            onClick={() => {
              if (selectedCampers.length > 0) {
                setDisplayModal(true);
              }
            }}
          >
            Reassign
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default ReassignmentSelectionDialog;
