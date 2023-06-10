const handleError = async (response) => {
  // Make json if content is json
  if (response.headers.get("content-type") === "application/json") {
    console.log("appjson");
    const err = await response.json();
    return err;
  } else {
    return { status: 400, message: response.statusText }
  }
}

const catchErrors = async (response, onError) => {
  if (!response.ok) {
    const error = await handleError(response)
    onError(error);
    return false;
  }
  return response;
}

export default catchErrors;
