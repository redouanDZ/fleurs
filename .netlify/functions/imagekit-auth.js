const ImageKit = require("imagekit");

exports.handler = async function (event, context) {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
      },
      body: ""
    };
  }

  try {
    const imagekit = new ImageKit({
      publicKey: "public_aF1VLWznWZonCwPUp2VzFSZFFjw=",
      privateKey: "private_uCCV************************",
      urlEndpoint: "https://ik.imagekit.io/rkndkbsiy",
    });

    const authenticationParameters = imagekit.getAuthenticationParameters();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
      },
      body: JSON.stringify(authenticationParameters),
    };
  } catch (err) {
    return { 
      statusCode: 500, 
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: JSON.stringify({ error: err.message }) 
    };
  }
};
