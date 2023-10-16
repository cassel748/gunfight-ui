import { reject } from "lodash";
import zlib from "zlib";

const REPORT_API = "https://report.gunfight.app/generate";

export const getPdfBuffer = (html, res, { margin, landscape, displayHeaderFooter }) => {
  if (!res) {
    return;
  }

  return new Promise(async (resolve) => {
    console.log("Request to: ", REPORT_API);

    // Remove this after check any missing variable replacement
    let newHtml = html.split("{{").join("");
    newHtml = newHtml.split("}}").join("");

    const data = {
      html: newHtml,
      margin,
      landscape,
      displayHeaderFooter,
    };

    const body = JSON.stringify(data);

    const response = await fetch(REPORT_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body,
    });

    const pdf = await response.arrayBuffer();
    console.log("Finished request to: ", REPORT_API);

    console.log("Gzip pdf buffer");
    zlib.gzip(pdf, (error, buffer) => {
      if (error) {
        reject("PDF Gzip error");
      }

      console.log("Gzip pdf buffer finished");
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Encoding", "gzip");
      res.end(buffer);
      resolve(buffer);
    });
  });
}
