const sharp = require('sharp')
const base64Img = require('base64-img');
const s3Client = require('./s3-client');
const fs = require('fs')

const base64Promise = (base64Str, path, fileName) => {
  return new Promise((resolve, reject) => {
    base64Img.img(base64Str, path, fileName, (err, filepath) => {
      if(err) return reject(err);
      resolve(filepath)
    })
  })
}

async function uploadImage(imageObjectVerbose, organizationId, maxWidth = 600) {
  const { dataUrl, name } = imageObjectVerbose;
  const extension = name.lastIndexOf('.') >= 0
    ? `${name.substr(name.lastIndexOf('.') + 1)}`
    : '';

  const base64Str = dataUrl;
  const path = `${process.cwd()}/public/uploads/`;
  const optionalObj = { 'type': extension };
  const fileName = `img-${Date.now()+Math.round(Math.random()*100)}`;
  
  const filepath = await base64Promise(base64Str, path, fileName)
  const image_s3_url = `uploads/${organizationId}/${fileName}.${extension}`;
  const resizedPath = `${path}resized-${fileName}.${extension}`
  await sharp(filepath).resize(null, maxWidth).withoutEnlargement(true).toFile(resizedPath);

  const response = await s3Client.uploadToAmazonPromise(resizedPath, image_s3_url)
  fs.unlink(filepath, () => { })
  fs.unlink(resizedPath, () => { })

  return response

}

module.exports = { uploadImage }