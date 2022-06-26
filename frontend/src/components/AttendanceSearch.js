import tw from "twin.macro";
import "styled-components/macro";
import { PopOut } from "./styled";
import { useEffect, useState } from "react";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faCircleXmark} from '@fortawesome/free-regular-svg-icons'

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
    const newResults = activities.reduce((acc, cv) => {
      const campers = cv.campers.filter(
        (camper) =>
          camper.firstName.toUpperCase().includes(searchTerm) ||
          camper.lastName.toUpperCase().includes(searchTerm)
      );
      acc = [...acc, ...campers];
      return acc;
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
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
        tw="bg-coolGray-100 p-5 w-11/12 lg:w-1/2 my-4 rounded shadow-lg flex-grow relative flex flex-col overflow-scroll overscroll-none "
      >
        <button tw="absolute top-1 right-3"onClick={closeSearchModal}><FontAwesomeIcon size="xl" icon={faCircleXmark} /></button>
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
            {results.length === 0 && <li tw="text-3xl md:text-8xl text-coolGray-400">no campers found :(</li>}
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
      </div>
    </PopOut>
  );
};

export default AttendanceSearch;
