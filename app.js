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
  mergeGM,
  mergeAvatar,
  mergeWithSharp,
} = require("./helpers/utils.js");

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
app.get("/make-avatar", async (req, res) => {
  const { bg, head, face, clothes } = req.query;

  // flag between merge-image & imageMagick lib
  const cid = req.query.cid
    ? req.query.cid
    : process.env.COMPONENTS_FOLDER_HASH;
  const useGm = req.query.gm ? req.query.gm : "false";
  const useMerge = req.query.m ? req.query.m : "false";

  let response = {
    jobRunId: "1",
    statusCode: 400,
    data: {
      result: "",
    },
  };

  if (
    typeof cid !== "undefined" &&
    typeof bg !== "undefined" &&
    typeof head !== "undefined" &&
    typeof face !== "undefined" &&
    typeof clothes !== "undefined"
  ) {
    const bImg = await getComponentUri(cid, bg);
    const h = await getComponentUri(cid, head);
    const f = await getComponentUri(cid, face);
    const c = await getComponentUri(cid, clothes);

    if (bImg && h && f && c) {
      try {
        let avatarBuffer = null;

        if (useGm === "true") {
          // use gm(imageMagick)
          avatarBuffer = await mergeGM({ h, f, c });
        } else if (useMerge === "true") {
          //use merge-images
          avatarBuffer = await mergeAvatar([h, f, c]);
        } else {
          //use Sharp
          avatarBuffer = await mergeWithSharp({ bImg, h, f, c });
        }

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
    } else {
      response.statusCode = 404;
      return res.status(404).json(response);
    }
  }

  response.statusCode = 400;
  return res.status(400).json(response);
});

app.listen(8000, () =>
  console.log("EveryDay Avatar API Listening on port 8000!")
);
