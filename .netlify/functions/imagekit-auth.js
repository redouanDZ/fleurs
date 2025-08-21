
const ImageKit = require("imagekit");

exports.handler = async function (event, context) {
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

    const authenticationParameters = imagekit.getAuthenticationParameters();
    console.log("Auth parameters:", authenticationParameters); // For debugging

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
    console.error("Error generating auth parameters:", err);
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

