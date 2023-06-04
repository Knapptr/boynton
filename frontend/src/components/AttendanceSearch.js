import tw from "twin.macro";
import "styled-components/macro";
import { DialogBox, PopOut } from "./styled";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleXmark } from '@fortawesome/free-regular-svg-icons'

const AttendanceSearch = ({
  shouldDisplay,
  activities,
  closeSearchModal,
  periodNumber,
}) => {
  const [results, setResults] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (query === "") {
      setResults([]);
      return;
    }
    const searchTerm = query.toUpperCase();
    const newResults = activities.reduce((activityAcc, activityCv) => {
      const campers = activityCv.campers.reduce((camperAcc, camperCv) => {
        if (camperCv.firstName.includes(searchTerm) || camperCv.lastName.includes(searchTerm)) {
          camperAcc.push({ activityName: activityCv.name, ...camperCv })
        }
        return camperAcc
      }, [])
      activityAcc = [...activityAcc, ...campers];
      return activityAcc;
    }, []);
    setResults(newResults);
  }, [query, activities]);

  const handleChange = (e) => {
    setQuery(e.target.value);
  };
  return (
    <PopOut
      tw="justify-start"
      shouldDisplay={shouldDisplay}
      onClick={closeSearchModal}
    >
      <DialogBox
        full={true}
        onClick={(e) => {
          e.stopPropagation();
        }}
        scrollable={true}
        close={closeSearchModal}
      >
        <header>
          <h2 tw="text-2xl font-bold">Act {periodNumber} Camper Search</h2>
        </header>
        <div tw="my-5">
          <input
            placeholder="Enter Camper Name"
            onChange={handleChange}
            value={query}
            type="search"
            name="camperSearch"
            id="camperSearch"
            tw="text-xl md:text-3xl py-2 px-4"
          />
        </div>
        <div tw="flex-grow flex flex-col">
          <ul tw="bg-blueGray-300  w-full rounded flex-grow p-3">
            {results.length === 0 && <li tw="text-3xl md:text-8xl text-coolGray-400">no campers found <span>:(</span></li>}
            {results.map((camper, index) => {
              return (
                <li tw="rounded my-1 text-lg md:text-xl bg-green-400 even:bg-green-300 w-full md:w-11/12  flex justify-between items-center mx-auto py-2 px-1">
                  <span tw="w-1/2 font-bold ">
                    {camper.firstName} {camper.lastName}
                  </span>
                  <span >{camper.activityName || "Unassigned"}</span>
                </li>
              );
            })}
          </ul>
          <button tw="bg-orange-500 py-2 rounded my-2" onClick={closeSearchModal}>Close Search</button>
        </div>
      </DialogBox>
    </PopOut>
  );
};

export default AttendanceSearch;
