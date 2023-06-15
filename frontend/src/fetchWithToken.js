const fetchWithToken = async (url, options = {}, auth) => {
	// console.log(auth);
	const optionsWithToken = {
		...options,
		headers: { ...options.headers, authorization: `Bearer ${auth.userData.token}` },
	};
	try {
		const response = await fetch(url, optionsWithToken);
		return response;
	} catch {
		return { status: 400, message: `Failed to Fetch Data. Something Went Wrong. Check your network connection.` }
	}
};

export default fetchWithToken
