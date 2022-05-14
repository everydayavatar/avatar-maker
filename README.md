# Everyday Avatar

Everyday Avatar is an NFT profile picture project, inspired by paper doll toys. Just like real paper dolls, this dynamic NFT project lets you swap out what your Avatar is wearing or how it looks, whenever you want.

**Avatar Maker** is the backend component for our dApp, see 
[the Everyday Avatar react front end and Solidity contracts here.](https://github.com/Hussainzz/everyday-avatar)

## Avatar Maker

This is a node.js web service that dynamically builds Everyday Avatar images from the requested components. This image will either be returned for display or programatically uploaded to IPFS (via infura) and the IPFS CID will be returned instead.
### Endpoints Supported
`POST /make-avatar`  Dynamically builds the Avatar image, and uploads it to IPFS via infura and returns the IPFS CID.

`GET/update-view`  Dynamically builds the Avatar image, and returns the image via http. 


## Installation

https://www.npmjs.com/package/sharp

Install Node Packages

`npm install`

.env
```
INFURA_PROJECT_ID =
INFURA_PROJECT_SECRET =
COMPONENTS_FOLDER_HASH = HASH-POINTING_TO_YOUR_COMPONENTS_FOLDER( CAN USE QmRCv9weC5rDqDJioatWXCr8HcfgeG1T4HfmgXs1frQ7LG)
```

run the app
```
node app.js
```

 - First i uploded the everday-avatar folder on pinata pinned it to ipfs(i did this manually)
   https://ipfs.io/ipfs/QmRCv9weC5rDqDJioatWXCr8HcfgeG1T4HfmgXs1frQ7LG


## Demo

` GET http://127.0.0.1:8000/make-avatar?gm=true` ( will create-avatar with gm(ImageMagick) to compose images. )

` GET http://127.0.0.1:8000/make-avatar?m=true` ( will create-avatar with merge-images library)

` GET http://127.0.0.1:8000/make-avatar` ( will create-avatar with sharp library)


req-body [refer everyday-avatar dir]

bg - background component name
head - head component name
face - face component name
clothes - cloth component name

```
GET http://127.0.0.1:8000/make-avatar?bg=bg2&head=santacap&face=glasses&clothes=jacket

```

``` 
GET http://127.0.0.1:8000/make-avatar?bg=bg1&head=hair&face=mask&clothes=formals

```

## Response

```
{
    "jobRunId": "1",
    "statusCode": 200,
    "data": {
        "result": "QmfYtqtmQMqHumntuA2Ap8X8N9gQPWDfhWm5rjcueFzHp9"
    }
}

```
