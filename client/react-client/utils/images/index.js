export function loadImage(source) {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.addEventListener('load', () => resolve(img));

    img.src = source;
  });
}

export function toImageCache(images = []) {
  return images.reduce((map, image) => {
    const distIndex = image.src.indexOf('/dist');

    map[image.src.substring(distIndex, image.src.length)] = image;

    return map;
  }, {});
}

export function loadImages(sources = []) {
  return Promise.all(sources.map(source => loadImage(source)));
}

export function getImageSrc(source) {
  return `${source}?v=${window._CACHE_KEY}`;
}

export function getImageSrcFromCache(url) {
  return (window._IMAGES_BASE64[url] || url).replace(' charset=UTF-8;', '');
}
