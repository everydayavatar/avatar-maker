/** 
*  / ____/   _____  _______  __/ __ \____ ___  __
  / __/ | | / / _ \/ ___/ / / / / / / __ `/ / / /
 / /___ | |/ /  __/ /  / /_/ / /_/ / /_/ / /_/ / 
/_____/ |___/\___/_/   \__, /_____/\__,_/\__, /  
                      /____/            /____/   
    ___              __                ___    ____  ____
   /   |_   ______ _/ /_____ ______   /   |  / __ \/  _/
  / /| | | / / __ `/ __/ __ `/ ___/  / /| | / /_/ // /  
 / ___ | |/ / /_/ / /_/ /_/ / /     / ___ |/ ____// /   
/_/  |_|___/\__,_/\__/\__,_/_/     /_/  |_/_/   /___/  
*/
const ipfsClient = require("ipfs-http-client");
const express = require("express");
const app = express();

const {
  getComponentUri,
  mergeWithSharp
} = require("./helpers/utils.js");

const components = require("./assets.json");

require("dotenv").config();
app.use(express.json());

//Connecting to the ipfs network via infura gateway
const auth =
  "Basic " +
  Buffer.from(
    process.env.INFURA_PROJECT_ID + ":" + process.env.INFURA_PROJECT_SECRET
  ).toString("base64");

const ipfs = ipfsClient.create(
  {
    host: "ipfs.infura.io",
    port: "5001",
    protocol: "https",
    apiPath: "/api/v0",
    headers: {
      authorization: auth,
    },
  }
  // {
  //   host:'127.0.0.1',
  //   port: '5001',
  //   protocol: 'http',
  //   apiPath: '/api/v0',
  // }
);

/**
 * Make Avatar API
 *   -expects cid, and components and returns new cid ipfs hash
 */
app.post("/make-avatar", async (req, res) => {
  const {data} = req.body;

  const cid = req.body.cid
    ? req.body.cid
    : process.env.COMPONENTS_FOLDER_HASH;
   
  const BACKGROUND = 1;
  const HEAD = 2;
  const FACE = 3;
  const CLOTHES = 4;

  let response = {
    jobRunId: "1",
    statusCode: 400,
    data: {
      result: "",
    },
  };

  if(data){
    if((typeof data.id !== "undefined") && (data.id.length == 16)){
      const avatarDNA = data.id.match(/.{1,4}/g);
      if(avatarDNA){
        const bgDNA = parseInt(avatarDNA[0]);
        const headDNA = parseInt(avatarDNA[1]);
        const faceDNA = parseInt(avatarDNA[2]);
        const clothesDNA = parseInt(avatarDNA[3]);


        let bgHash = getAssetHash(BACKGROUND, bgDNA);
        let headHash = getAssetHash(HEAD, headDNA);
        let faceHash = getAssetHash(FACE, faceDNA);
        let clothesHash = getAssetHash(CLOTHES, clothesDNA);

        if(bgHash && headHash && faceHash && clothesHash){
          const bgImg = await getComponentUri(bgHash.cid);
          const h = await getComponentUri(headHash.cid);
          const f = await getComponentUri(faceHash.cid);
          const c = await getComponentUri(clothesHash.cid); 
      
          if (bgImg && h && f && c) {
            try {
              let avatarBuffer = await mergeWithSharp({ bgImg, h, f, c });
      
              if (avatarBuffer) {
                const avName = `avatar-${Date.now()}`;
                const createNewAvatar = await ipfs.add({
                  path: avName,
                  content: avatarBuffer,
                });
                
                if (createNewAvatar) {
                  //pin and add to ipfs
                  await ipfs.pin.add(createNewAvatar.cid);
                  
                  response.statusCode = 200;
                  response.data.result = createNewAvatar.cid.toString();
                  return res.status(200).json(response);
                } else {
                  response.statusCode = 500;
                  return res.status(500).json(response);
                }
              }
            } catch (err) {
              console.log(err);
              response.statusCode = 500;
              return res.status(500).json(response);
            }

          }else {
            //Asset Not Found
            response.statusCode = 404;
            return res.status(404).json(response);
          }
        }else{
          //Asset Not Found
          response.statusCode = 404;
          return res.status(404).json(response);
        }
      }
    }
  }

  response.statusCode = 400;
  return res.status(400).json(response);
});

const getAssetHash = (catId, assetId) => {
 try {
  const {assets} = components;
   if(typeof assets !== "undefined"){
    return assets.find(asset => ((asset.categoryId == catId) && (asset.assetId == assetId)));
  }
  return false;
 } catch (err) {
   console.log(err);
   return false;
 }
}

app.listen(process.env.PORT || 8000, () =>
  console.log("EveryDay Avatar API Listening on port 8000!")
);
