require("dotenv").config()
const filePath = process.argv[2];
const username = process.argv[3];
const password = process.argv[4];
const destinationUrl = process.argv[5];

const getToken = async () =>{
  const url = destinationUrl + "/auth/login"
  const options = {
	method: "POST",
	headers: {
	  "Content-Type": "application/json"
	},
    body : JSON.stringify({username,password})
  }
  const response = await fetch(url,options);
  const data = await response.json();
  const {token} = data;
  return token;
}

const requestWithToken = async (url,token,config) => {
  const options = {
	method: "POST",
	headers: {
	  authorization: `bearer ${token}`,
	  "content-type": "application/json"
	},
	body: JSON.stringify(config)
  }

  const response = await fetch(url,options);
  const data = await response.json();
  return data;
}

const main = async ()=>{
  try{
  const data = require(filePath);
  // check if data is json
  console.log("Verifying JSON")
  JSON.stringify(data);
  // get token
  console.log("Getting authorization token");
  const token = await getToken();
  console.log("Got Authorization token")
  const url = destinationUrl + "/api/config"
  const createdData = await requestWithToken(url,token,data);
    console.log({createdData});
  console.log("Configured.")
  }catch(e){
	console.error("Something went wrong ...")
	console.error(e);
  }
}

main();
