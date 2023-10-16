export const urlToPageId = (url) => {
  return url.substring(1, url.lenght).split("/").join("-");
};

export const getQueryParam = (param) => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
};

export const getReport = async (html, css) => {
  return html.replace("</head>", `<style>${css}</style></head>`);
};

export const getProtocol = (req) => {
  var proto = req.connection.encrypted ? "https" : "http";
  // only do this if you trust the proxy and its secure
  proto = req.headers["x-forwarded-proto"] || proto;
  return proto.split(/\s*,\s*/)[0];
};

export const getServerUrl = (req) => {
  const host = req.headers.host;
  const protocol = getProtocol(req);
  return `${protocol}://${host}`;
};

export const getLogoPath = (req) => {
  return `https://report.gunfight.app/images/logo_gunfight.png`;
};

export const getStampPath = (req) => {
  return `https://report.gunfight.app/images/carimbo.png`;
};

export const getnewPath = (req) => {
  return `https://report.gunfight.app/images/logo-doc.png`;
};
