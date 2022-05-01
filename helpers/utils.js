const fs = require('fs');
const axios = require('axios');
const GM = require('gm');
const gm = GM.subClass({ imageMagick: true });
const urlExists = require("url-exists-deep");
const mergeImages = require('merge-images');
const { Canvas, Image } = require('node-canvas');
const sharp = require('sharp');

const downloadTmpImage = async (url, name) => {
  return new Promise(async (resolve, reject) => {
    const res = await axios.get(url, { responseType: "arraybuffer" });
    if (res.data) {
      fs.writeFileSync(`./tmp/${name}.png`, Buffer.from(res.data, "binary"));
      return resolve(true);
    }
    return reject(false);
  });
};

const getImageBuffer = async (url) => {
  return new Promise(async (resolve, reject) => {
    const res = await axios.get(url, { responseType: "arraybuffer" });
    if (res.data) {
      return resolve(Buffer.from(res.data, "binary"));
    }
    return reject(false);
  });
};

const removeFile = async (name) => {
  fs.unlink(`./tmp/${name}.png`, (err) => {
    if (err) throw err;
    console.log("deleted");
  });
};

module.exports.mergeWithSharp = async (attr) => {
  try {
    const { bImg, h, f, c } = attr;

    const bgBuffer = await getImageBuffer(bImg);
    const hBuffer = await getImageBuffer(h);
    const fBuffer = await getImageBuffer(f);
    const cBuffer = await getImageBuffer(c);

    if (bgBuffer && hBuffer && fBuffer && cBuffer) {
      const avatarBuffer = await sharp(bgBuffer)
        .composite([{ input: hBuffer }, { input: fBuffer }, { input: cBuffer }])
        .toBuffer();
      return avatarBuffer;
    }
    return false;
  } catch (error) {
    console.log(error);
    return false;
  }
};

module.exports.mergeGM = async (attr) => {
  const { h, f, c } = attr;

  const hair = await downloadTmpImage(h, "h");
  const face = await downloadTmpImage(f, "f");
  const clothes = await downloadTmpImage(c, "c");

  if (hair && face && clothes) {
    return new Promise((resolve, reject) => {
      gm()
        .in("-geometry", "+0+0")
        .in("./tmp/h.png")
        .in("-geometry", "300x300+100+200")
        .in("./tmp/c.png")
        .in("-geometry", "300x300+100+200")
        .in("./tmp/f.png")
        .flatten()
        .toBuffer("png", async (err, buffer) => {
          if (err) {
            return reject(err);
          }
          await removeFile("h");
          await removeFile("f");
          await removeFile("c");
          return resolve(buffer);
        });
    });
  }
  return false;
};

module.exports.mergeAvatar = async (attributes = []) => {
  try {
    if (attributes.length) {
      const image = await mergeImages(attributes, {
        Canvas: Canvas,
        Image: Image,
      });
      return Buffer.from(
        image.replace(/^data:image\/(png|gif|jpeg);base64,/, ""),
        "base64"
      );
    }
    return false;
  } catch (error) {
    console.log(error);
    return false;
  }
};

module.exports.getComponentUri = async (hash, name) => {
  try {
    const uri = `https://ipfs.io/ipfs/${hash}/${name}.png`;
    //const uri = `http://bafybeihimrd56uahubq4iibyjm2yayq7jbfwleruyjbzzmq2uwncukwffi.ipfs.localhost:8080/${name}.png`;
    const data = await urlExists(uri);
    if (typeof data.href !== "undefined") {
      return data.href;
    }
    return false;
  } catch (error) {
    return false;
  }
};
