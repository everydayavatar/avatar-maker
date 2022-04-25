//Required modules
const ipfsClient = require('ipfs-http-client');
const express = require('express');
const app = express();
const fs = require('fs');
const axios = require('axios');
const GM = require('gm');
const gm = GM.subClass({ imageMagick: true });
const urlExists = require("url-exists-deep");
const mergeImages = require('merge-images');
const { Canvas, Image } = require('node-canvas');

require('dotenv').config()
app.use(express.json());

//Connecting to the ipfs network via infura gateway
const auth = 'Basic ' + Buffer.from(process.env.INFURA_PROJECT_ID + ':' + process.env.INFURA_PROJECT_SECRET ).toString('base64')

const ipfs = ipfsClient.create(
  {
  host:'ipfs.infura.io',
  port: '5001',
  protocol: 'https',
  apiPath: '/api/v0',
  headers: {
    authorization: auth
  }
}
// {
//   host:'127.0.0.1',
//   port: '5001',
//   protocol: 'http',
//   apiPath: '/api/v0',
// }
)


app.post("/make-avatar", async (req, res) => {

  const { cid, head, face, clothes } = req.body;

  // flag between merge-image & imageMagick lib
  const useGm = req.query.gm ? req.query.gm : 'true';

  if (
    typeof cid !== "undefined" &&
    typeof head !== "undefined" &&
    typeof face !== "undefined" &&
    typeof clothes !== "undefined"
  ) {
    const h = await getComponentUri(cid, head);
    const f = await getComponentUri(cid, face);
    const c = await getComponentUri(cid, clothes);

    
    if (h && f && c) {
      try {
        let avatarBuffer = null;

        if(useGm === 'true'){
          // use gm(imageMagick)
          avatarBuffer = await mergeGM({h,f,c});
        }else{
          //use merge-images
          avatarBuffer = await mergeAvatar([h,f,c]);
        }

        if(avatarBuffer){
          const avName = `avatar-${Date.now()}`;
          const createNewAvatar = await ipfs.add({
              path: avName,
              content: avatarBuffer
          });
          if(createNewAvatar){
            await ipfs.pin.add(createNewAvatar.cid)
            return res.status(201).json({
              status: 'success',
              name: avName,
              message: `https://ipfs.io/ipfs/${createNewAvatar.cid}`
            })
          }else{
            return res.status(500).json({
              status: 'error',
              message: 'Something went wrong'
            })
          }
        }
      } catch (err) {
        console.log(err);
        return res.status(500).json({
          status: 'error',
          message: 'Something went wrong'
        })
      }
      
    }else{
      return res.status(404).json({
        status: 'failed',
        message: 'Attribute Not Found'
      })
    }
  }

  res.status(400).json({
    status: 'failed',
    message: 'Bad Request'
  })
});

//TEST ROUTE TO PUSH SINGLE FILE TO IPFS
app.get('/add-file', async(req, res) => {
  // try {
  //   let file = fs.readFileSync("./a.png");
    
  //   const addedFiles = await ipfs.add({
  //     path:'glasses2',
  //     content: file
  //   });
  //   const fileHash = addedFiles;
  //  console.log(fileHash);

  // } catch (error) {
  //     console.log(error);
  // }
});

const downloadTmpImage = async (url, name) => {
  return new Promise(async (resolve, reject) => {
    const res = await axios.get(url, { responseType: 'arraybuffer' });
    if(res.data){
      fs.writeFileSync(`./tmp/${name}.png`,Buffer.from(res.data, 'binary'));
      return resolve(true);
    }
    return reject(false);
  });
};

const removeFile = async (name) => {
  fs.unlink(`./tmp/${name}.png`, (err) => {
    if (err) throw err;
    console.log('deleted');
  });
}

const mergeGM = async(attr) => {
  const {h, f, c} = attr
  
  const hair = await downloadTmpImage(h, 'h');
  const face = await downloadTmpImage(f, 'f');
  const clothes = await downloadTmpImage(c, 'c');
  
  if(hair && face && clothes){
    return new Promise((resolve, reject) => {
      gm()
      .in('-geometry', '+0+0')
      .in('./tmp/h.png')
      .in('-geometry', '300x300+100+200')
      .in('./tmp/c.png')
      .in('-geometry', '300x300+100+200')
      .in('./tmp/f.png')
      .flatten()
      .toBuffer('png', async (err, buffer) => {
        if(err){
          return reject(err)
        }
        await removeFile('h');
        await removeFile('f');
        await removeFile('c');
        return resolve(buffer)
      })
    });
  }
  return false;
}

 const mergeAvatar = async(attributes = []) => {
  try {
    if(attributes.length){
      const image = await mergeImages(attributes, { Canvas: Canvas, Image: Image })
      return Buffer.from(image.replace(/^data:image\/(png|gif|jpeg);base64,/,''), 'base64');
    }
    return false;
  } catch (error) {
    console.log(error);
    return false
  }
}

const getComponentUri = async (hash, name) => {
  try {
    const uri = `https://ipfs.io/ipfs/${hash}/${name}.png`;
    //const localUri = `http://bafybeihimrd56uahubq4iibyjm2yayq7jbfwleruyjbzzmq2uwncukwffi.ipfs.localhost:8080/${name}.png`
    const data = await urlExists(uri);
    if(typeof data.href !== 'undefined'){
      return data.href;
    }
    return false;
  } catch (error) {
    return false;
  }
};

app.listen(8000, () => console.log('Server Listening on port 8000!'))