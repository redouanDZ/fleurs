
const ImageKit = require("imagekit");

exports.handler = async function (event, context) {
  try {
    const imagekit = new ImageKit({
      publicKey: "public_aF1VLWznWZonCwPUp2VzFSZFFjw=",
      privateKey: "private_uCCV************************",
      urlEndpoint: "https://ik.imagekit.io/rkndkbsiy",
    });

    const authenticationParameters = imagekit.getAuthenticationParameters();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(authenticationParameters),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};

