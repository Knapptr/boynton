export default async (url, options = {}) => {
	const token = localStorage.getItem("bearerToken");
	const optionsWithToken = {
		...options,
		headers: { ...options.headers, authorization: `Bearer ${token}` },
	};
	const response = await fetch(url, optionsWithToken);
	return response;
};
