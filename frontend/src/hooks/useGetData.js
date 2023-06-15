import { useContext, useState, useEffect, useCallback } from "react";
import UserContext from "../components/UserContext";
import fetchWithToken from "../fetchWithToken";
import { useNavigate, useLocation } from "react-router-dom";

const useGetDataOnMount = ({
  url,
  initialState,
  beforeSet,
  afterSet,
  optionalSortFunction,
  // runOn = [],
  useToken = false,
}) => {
  const [data, setData] = useState(initialState);
  const [loaded, setLoaded] = useState(false)
  const auth = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const fetchAndSet = useCallback(async ({
    url,
    beforeSet,
    handler,
    callback,
    optionalSortFunction,
    useToken = false,
  }) => {
    const response = useToken
      ? await fetchWithToken(url, {}, auth)
      : await fetch(url);
    if (response.status === 401) {
      auth.logOut();
      navigate("/login", { state: { cameFrom: location.pathname } });
    }
    let data = await response.json();
    if (optionalSortFunction) {
      data.sort(optionalSortFunction);
    }
    if (beforeSet) {
      data = beforeSet(data);
    }
    handler(data);
    setLoaded(true)
    if (callback) {
      callback(data);
    }
  }, [auth, location.pathname, navigate]);
  const update = useCallback(() => {
    console.log("Updating");
    fetchAndSet({
      url,
      beforeSet: (d) => { console.log({ d }); return d },
      handler: setData,
      afterSet,
      optionalSortFunction,
      useToken,
    });
  }, [optionalSortFunction, useToken, afterSet, url, fetchAndSet]);

  useEffect(() => {
    fetchAndSet({
      url,
      beforeSet,
      handler: setData,
      afterSet,
      optionalSortFunction,
      useToken,
    });
  }, [afterSet,beforeSet,fetchAndSet,optionalSortFunction,url,useToken]);

  return [data, setData, update, loaded];
};

export default useGetDataOnMount;
