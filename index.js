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
const Hash = require('ipfs-only-hash')
const isIPFS = require('is-ipfs')
const cors = require('cors')

const NodeCache = require( "node-cache" );
const nodeCache = new NodeCache();

const app = express();

const {
  mergeWithSharp
} = require("./helpers/utils.js");

const {
  checkIfIpfs,
  updateCID
} = require("./helpers/everydayAvatar.js")

const components = require("./assets.json");

app.use(cors())

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


app.get('/', (req, res) => {
  return res.status(200).json({
    avatarAPI: 'HEALTHY...'
  })
});


/** 
 * View Avatar API 
 * returns base64 Image for valid attributeIds
*/
app.get('/view-avatar/:attributeIds', async(req, res) => {
   const {attributeIds} = req.params;
   if((typeof attributeIds !== "undefined") && (attributeIds.length == 16)){
    const avatarDNA = attributeIds.match(/.{1,4}/g);
    if(avatarDNA){

        const BACKGROUND = 1;
        const HEAD = 2;
        const FACE = 3;
        const CLOTHES = 4;

        const bgDNA = parseInt(avatarDNA[0]);
        const headDNA = parseInt(avatarDNA[1]);
        const faceDNA = parseInt(avatarDNA[2]);
        const clothesDNA = parseInt(avatarDNA[3]);

        let bgHash = getAssetHash(BACKGROUND, bgDNA);
        let headHash = getAssetHash(HEAD, headDNA);
        let faceHash = getAssetHash(FACE, faceDNA);
        let clothesHash = getAssetHash(CLOTHES, clothesDNA);

        try {
            
          let avatarBuffer = await mergeWithSharp({ bgHash, headHash, faceHash, clothesHash });
          
          if (avatarBuffer) {
             //const avatar =  `data:image/png;base64,${avatarBuffer.toString('base64')}`
            res.writeHead(200, {
              'Content-Type': 'image/png',
              'Content-Length': avatarBuffer.length
            });
            return res.end(avatarBuffer); 

          }
        } catch (err) {
          console.log(err);
          return res.status(500).send('Something went wrong');
        }
    }
  }

  return res.status(400).send('Bad Request');
});


/**
 * Updates CID Hash on Chain
 *   -expects tokenId, hash, owner & returns txn hash and bool
 */
 app.post("/update-avatar-ipfs", async (req, res) => {
    const {token, hash, owner} = req.body;
    let httpCode = 500;
    let response = {
      success:false,
      msg: "error"
    }
    if((typeof token !== "undefined") && (typeof hash !== "undefined") && (typeof owner !== "undefined")){
      if(isIPFS.cid(hash)){
        //const isTokenOwner = await checkTokenOwner(token, owner);
        try {
          const isIpfs = await checkIfIpfs(token);
          
          if(!isIpfs){
            const update = await updateCID(token, hash);
            if(update){
              httpCode = 200
              response.success = true;
              response.h = update
              response.msg = "success";
              //set txn hash for tokenId in cache [expires in 20min]
              nodeCache.set(`token-${token}`,h, 1800);
            }
          }else{
            httpCode = 200;
            response.msg = "already_ipfs"
          }
        } catch (error) {
          console.log(error);
        }
        
      }else{
        httpCode = 400
        response.msg = "invalid cid hash passed";
      }
    }
    res.status(httpCode).json(response);
 });


/**
 * Make Avatar API
 *   -expects cid, and components and returns new cid ipfs hash
 */
app.post("/make-avatar", async (req, res) => {
  const {data} = req.body;
  const {ipfs} = req.query;
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
      msg: ""
    },
  };

  if(ipfs){
    const tokenKey = `token-${data.tokenId}`
    const tokenTxn = await nodeCache.get(tokenKey);
    if(typeof tokenTxn !== "undefined"){
      response.statusCode = 200;
      response.data.msg = "ipfs_inProgress";
      response.data.result = `IPFS Txn:${tokenTxn} Already in progress`
      return res.status(response.statusCode).json(response);
    }
  }
  

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

            try {
            
              let avatarBuffer = await mergeWithSharp({ bgHash, headHash, faceHash, clothesHash });
              
              if (avatarBuffer) {
                const calculatedHash = await Hash.of(avatarBuffer)

                const cids = await nodeCache.get(calculatedHash);
                if(typeof cids !== "undefined"){
                  console.log('already exists returning calculated hash....')
                  response.statusCode = 200;
                  response.data.result = calculatedHash.toString();
                  return res.status(200).json(response);
                }

                const avName = `avatar-${Date.now()}`;
                const createNewAvatar = await ipfs.add({
                  path: avName,
                  content: avatarBuffer,
                });

                if (createNewAvatar) {
                  //pin and add to ipfs
                  await ipfs.pin.add(createNewAvatar.cid);
                  
                  nodeCache.set(createNewAvatar.cid.toString(),"true", 180000);

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
      }
    }
  }

  return res.status(response.statusCode).json(response);
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
