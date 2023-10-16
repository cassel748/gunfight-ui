import { STORAGE_PREFIX } from "./auth";

export const apiFetch = async (url, dataOrMethod, method) => {
  let apiUrl = `/api/${url}`;;
  const user = JSON.parse(window.localStorage.getItem(`${STORAGE_PREFIX}userInfo`));

  const fetchConfig = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: user.idToken,
    },
  };

  const dataOrMethodParsed = typeof dataOrMethod === 'string' ? dataOrMethod.toLowerCase() : dataOrMethod;
  const methodParsed = method ? method.toLowerCase() : null;

  if (
    typeof dataOrMethod === 'string' &&
    (dataOrMethodParsed === 'post' || dataOrMethodParsed === 'get')
  ) {
    fetchConfig.method = dataOrMethod;
  }

  if (methodParsed === 'post' && dataOrMethod && typeof dataOrMethod === 'object') {
    fetchConfig.body = JSON.stringify(dataOrMethod);
  }

  if (methodParsed === 'get' && dataOrMethod && typeof dataOrMethod === 'object') {
    const queryParams = new URLSearchParams(dataOrMethod);
    apiUrl += `?${queryParams.toString()}`;
  }

  const response = await fetch(apiUrl, fetchConfig);
  return response ? response.json() : response;
};
