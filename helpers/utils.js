// const fs = require('fs');
const axios = require('axios');
// const GM = require('gm');
// const gm = GM.subClass({ imageMagick: true });
const urlExists = require("url-exists-deep");
// const mergeImages = require('merge-images');
// const { Canvas, Image } = require('node-canvas');
const fs = require('fs');
const sharp = require('sharp');

// const downloadTmpImage = async (url, name) => {
//   return new Promise(async (resolve, reject) => {
//     const res = await axios.get(url, { responseType: "arraybuffer" });
//     if (res.data) {
//       fs.writeFileSync(`./tmp/${name}.png`, Buffer.from(res.data, "binary"));
//       return resolve(true);
//     }
//     return reject(false);
//   });
// };

const getImageBuffer = async (hash) => {
  return new Promise(async (resolve, reject) => {
    console.log(`https://ipfs.io/ipfs/${hash}`)
    const res = await axios.get(`https://ipfs.io/ipfs/${hash}`, { responseType: "arraybuffer" });
    if (res.data) {
      return resolve(Buffer.from(res.data, "binary"));
    }
    return reject(false);
  });
};

// const removeFile = async (name) => {
//   fs.unlink(`./tmp/${name}.png`, (err) => {
//     if (err) throw err;
//     console.log("deleted");
//   });
// };

module.exports.mergeWithSharp = async (attr) => {
  try {
    const { bgImg, headHash, faceHash, clothesHash } = attr;
    let inputComposite = undefined;
    if(typeof bgImg !== "undefined"){
      //const bgBuffer = await getImageBuffer(bgImg.cid); 
      const bgBuffer = fs.readFileSync(`./components/${bgImg.assetId}.png`);
      inputComposite = bgBuffer;
    }else{
      //const bgDefault = await getImageBuffer('QmVGwYY7p9CFAMKNmeBGb5VC8SNKe5hfQmTccmCswGf5Nr');
      const bgDefault = fs.readFileSync(`./components/56.png`);

      inputComposite = bgDefault;
    }

    
    let avatarMerge = [];
    if(typeof headHash !== "undefined"){
      //const hBuffer = await getImageBuffer(headHash.cid);
      const hBuffer = fs.readFileSync(`./components/${headHash.assetId}.png`);
      avatarMerge.push({ input: hBuffer });
    }

    if(typeof clothesHash !== "undefined"){
      //const cBuffer = await getImageBuffer(clothesHash.cid);
      const cBuffer = fs.readFileSync(`./components/${clothesHash.assetId}.png`);
      avatarMerge.push({ input: cBuffer });
    }

    if(typeof faceHash !== "undefined"){
      //const fBuffer = await getImageBuffer(faceHash.cid);
      const fBuffer = fs.readFileSync(`./components/${faceHash.assetId}.png`);
      avatarMerge.push({ input: fBuffer });
    }
    

    if (avatarMerge.length) {
      const avatarBuffer = await sharp(inputComposite)
        .composite(avatarMerge)
        .toBuffer();
      return avatarBuffer;
    }
    return false;
  } catch (error) {
    console.log(error);
    return false;
  }
};

// module.exports.mergeGM = async (attr) => {
//   const { h, f, c } = attr;

//   const hair = await downloadTmpImage(h, "h");
//   const face = await downloadTmpImage(f, "f");
//   const clothes = await downloadTmpImage(c, "c");

//   if (hair && face && clothes) {
//     return new Promise((resolve, reject) => {
//       gm()
//         .in("-geometry", "+0+0")
//         .in("./tmp/h.png")
//         .in("-geometry", "300x300+100+200")
//         .in("./tmp/c.png")
//         .in("-geometry", "300x300+100+200")
//         .in("./tmp/f.png")
//         .flatten()
//         .toBuffer("png", async (err, buffer) => {
//           if (err) {
//             return reject(err);
//           }
//           await removeFile("h");
//           await removeFile("f");
//           await removeFile("c");
//           return resolve(buffer);
//         });
//     });
//   }
//   return false;
// };

// module.exports.mergeAvatar = async (attributes = []) => {
//   try {
//     if (attributes.length) {
//       const image = await mergeImages(attributes, {
//         Canvas: Canvas,
//         Image: Image,
//       });
//       return Buffer.from(
//         image.replace(/^data:image\/(png|gif|jpeg);base64,/, ""),
//         "base64"
//       );
//     }
//     return false;
//   } catch (error) {
//     console.log(error);
//     return false;
//   }
// };

module.exports.getComponentUri = async (hash) => {
  try {
    const uri = `https://ipfs.io/ipfs/${hash}`;
    //const uri = `http://bafybeifan7vy44gizema3odwktgs6jq6z3lt4t7xqexucvop7ebjzghhie.ipfs.localhost:8080/${type}/${dna}.png`;
    const data = await urlExists(uri);
    if (typeof data.href !== "undefined") {
      return data.href;
    }
    return false;
  } catch (error) {
    return false;
  }
};
