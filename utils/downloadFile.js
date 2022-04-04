const stream = require("stream");
const { promisify } = require("util");
const axios = require("axios");
const fs = require("fs");

const finished = promisify(stream.finished);

async function downloadFile(url, dest) {
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });

  const writer = fs.createWriteStream(dest);
  response.data.pipe(writer);

  await finished(writer);
}

module.exports = downloadFile;
