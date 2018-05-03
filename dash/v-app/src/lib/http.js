/* eslint-disable */
import getCookieByName from "./cookie";

const getAuthCookie = () => getCookieByName("jwt");

const createOptions = () => {
  return {
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      Authorization: `JWT ${getAuthCookie()}`
    }
  };
};

const checkStatus = async response => {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    var error = new Error(response.statusText);
    const contentType = response.headers.get("content-type") || "";
    if (contentType.indexOf("json") > -1) {
      error.response = await response.json();
    } else error.response = response;
    error.status = response.status;
    throw error;
  }
};

const fetchObject = {
  get: async url => {
    const result = await fetch(url, createOptions());
    await checkStatus(result);
    return result.json();
  },
  post: async (url, body) => {
    const result = await fetch(url, {
      method: "POST",
      body: JSON.stringify(body),
      ...createOptions()
    });
    await checkStatus(result);
    return result.json();
  },
  put: async (url, body) => {
    const result = await fetch(url, {
      method: "PUT",
      body: JSON.stringify(body),
      ...createOptions()
    });
    await checkStatus(result);
    return result.json();
  },
  delete: async (url) => {
    const result = await fetch(url, {
      method: "DELETE",
      ...createOptions()
    });
    await checkStatus(result);
    return result.json();
  }
};

const addErrorHandling = inputFn => {
  return async function(url, body) {
    try {
      return await inputFn(url, body);
    } catch (e) {
      return { error: e };
    }
  };
};

export default {
  get: addErrorHandling(fetchObject.get),
  post: addErrorHandling(fetchObject.post),
  put: addErrorHandling(fetchObject.put),
  delete: addErrorHandling(fetchObject.delete)
};
