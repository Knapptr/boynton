export default async (url, options = {}) => {
	const token = localStorage.getItem("bearerToken");
	const optionsWithToken = {
		...options,
		headers: { ...options.headers, authorization: `Bearer ${token}` },
	};
	const data = await fetch(url, optionsWithToken);
	return data;
};
