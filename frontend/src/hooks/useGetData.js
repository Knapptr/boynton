import { useState, useEffect } from "react";
import fetchWithToken from "../fetchWithToken";
import { useNavigate, useLocation } from "react-router-dom";

const useGetDataOnMount = ({
	url,
	initialState,
	beforeSet,
	afterSet,
	optionalSortFunction,
	runOn = [],
	useToken = false,
}) => {
	const [data, setData] = useState(initialState);
	const navigate = useNavigate();
	const location = useLocation();
	const fetchAndSet = async ({
		url,
		beforeSet,
		handler,
		callback,
		optionalSortFunction,
		useToken = false,
	}) => {
		const response = useToken
			? await fetchWithToken(url)
			: await fetch(url);
		if (response.status === 401) {
			localStorage.removeItem("bearerToken");
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
		if (callback) {
			callback(data);
		}
	};
	useEffect(() => {
		fetchAndSet({
			url,
			beforeSet,
			handler: setData,
			afterSet,
			optionalSortFunction,
			useToken,
		});
	}, [...runOn]);

	return [data, setData];
};

export default useGetDataOnMount;