import { STORAGE_PREFIX } from "./auth";
import Toast from "./toast";

export const printFile = async (
  url,
  filter,
  type = "pdf",
  filename,
  method
) => {
  const user = JSON.parse(
    window.localStorage.getItem(`${STORAGE_PREFIX}userInfo`)
  );
  const params = method === "GET" ? new URLSearchParams(filter).toString() : [];
  const config = {
    method: method ?? "GET",
    headers: {
      Authorization: user.idToken,
    },
  };
  if (method === "POST") {
    config.body = JSON.stringify(filter);
  }
  const response = await fetch(
    `${url}${params && params.length ? "?" + params : ""}`,
    config
  );

  const contentType = await response.headers.get("Content-Type");

  if (contentType.indexOf("application/json") > -1) {
    const responseData = await response.json();

    if (responseData && responseData.success === false) {
      return Toast.error(responseData.message);
    }
  }

  const data = await response.blob();
  const fileURL = window.URL.createObjectURL(data);
  if (type === "pdf") {
    let tab = window.open();
    tab.location.href = fileURL;
  }
  if (type === "xlsx") {
    const link = document.createElement("a");
    link.href = fileURL;
    link.setAttribute("download", `${filename || "data"}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  }
};
