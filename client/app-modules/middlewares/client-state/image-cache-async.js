const imageCache = require('image-cache');

function isCached(url) {
  return new Promise((resolve) => {
    imageCache.isCached(url, (result) => {
      resolve(result);
    });
  });
}

function setCache(url) {
  return new Promise((resolve, reject) => {
    imageCache.setCache(url, async (error) => {
      if (error) return reject(error);
      resolve();
    });
  });
}

function getImageFromCache(url) {
  return new Promise((resolve, reject) => {
    imageCache.getCache(url, (error, image) => {
      if (error) return reject(error);
      resolve(image);
    });
  });
}

async function fetch(url) {
  try {
    const urlIsCached = await isCached(url);
    if (urlIsCached) {
      return getImageFromCache(url);
    }

    await setCache(url);
    return getImageFromCache(url);
  } catch (e) {
    console.log(e);
    return undefined;
  }
}

module.exports = { fetch };
