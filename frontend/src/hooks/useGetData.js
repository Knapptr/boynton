import { useState, useEffect } from "react";

const fetchAndSet = async (
	url,
	beforeSet,
	handler,
	callback,
	optionalSortFunction
) => {
	const response = await fetch(url);
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
const useGetDataOnMount = ({
	url,
	initialState,
	beforeSet,
	afterSet,
	optionalSortFunction,
	runOn = [],
}) => {
	const [data, setData] = useState(initialState);
	useEffect(() => {
		fetchAndSet(url, beforeSet, setData, afterSet, optionalSortFunction);
	}, [...runOn]);

	return [data, setData];
};

export default useGetDataOnMount;
