const handleError = async (response) => {
  // Make json if content is json
  if (response instanceof Response && response.headers.get("Content-Type") === "application/json") {
    console.log("appjson");
    const err = await response.json();
    return err;
  } else {
    return { status: 400, message: response.statusText || "Error. Check your conection." }
  }
}

const catchErrors = async (response, onError) => {
  if (!response.ok) {
    const error = await handleError(response)
    console.log({ error });
    onError(error);
    return false;
  }
  return response;
}

export default catchErrors;
