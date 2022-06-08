 const fetchWithToken = async (url, options = {},auth) => {
   console.log(auth);
	const optionsWithToken = {
		...options,
		headers: { ...options.headers, authorization: `Bearer ${auth.userData.token}` },
	};
	const response = await fetch(url, optionsWithToken);
	return response;
};

export default fetchWithToken
