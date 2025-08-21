
const ImageKit = require("imagekit");

exports.handler = async function (event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { fileId } = JSON.parse(event.body || "{}");
    if (!fileId) return { statusCode: 400, body: "fileId required" };

      const imagekit = new ImageKit({
         publicKey: "public_aF1VLWznWZonCwPUp2VzFSZFFjw=",
         privateKey: "private_uCCV************************",
         urlEndpoint: "https://ik.imagekit.io/rkndkbsiy",
       });

    await imagekit.deleteFile(fileId);

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
