const ImageKit = require("imagekit");

exports.handler = async function (event, context) {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "https://fleursdz.netlify.app",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: "",
    };
  }

  try {
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error("IMAGEKIT_PRIVATE_KEY is not set");
    }

    const imagekit = new ImageKit({
      publicKey: "public_aF1VLWznWZonCwPUp2VzFSZFFjw=",
      privateKey: privateKey,
      urlEndpoint: "https://ik.imagekit.io/rkndkbsiy",
    });

    // Generate Unix timestamp for 2 hours from now
    const expire = Math.floor(Date.now() / 1000) + 7200;
    const authenticationParameters = imagekit.getAuthenticationParameters(null, expire);
    console.log("Generated auth parameters:", authenticationParameters);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://fleursdz.netlify.app",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify(authenticationParameters),
    };
  } catch (err) {
    console.error("Error generating auth parameters:", err.message);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://fleursdz.netlify.app",
      },
      body: JSON.stringify({ error: err.message }),
    };
  }
};