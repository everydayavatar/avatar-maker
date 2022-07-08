# Everyday Avatar

Everyday Avatar is an NFT profile picture project, inspired by paper doll toys. Just like real paper dolls, this dynamic NFT project lets you swap out what your Avatar is wearing or how it looks, whenever you want.

**Avatar Maker** is the backend component for our dApp, see 
[the Everyday Avatar react front end and Solidity contracts here.](https://github.com/Hussainzz/everyday-avatar)

## Avatar Maker

This is a node.js web service that dynamically builds Everyday Avatar images from the requested components. This image will either be returned for display or programatically uploaded to IPFS (via infura) and the IPFS CID will be returned instead.
### Endpoints Supported
`POST /make-avatar`  Dynamically builds the Avatar image, and uploads it to IPFS via infura and returns the IPFS CID.

`GET /view-avatar/${componentIDs}`  Dynamically builds the Avatar image, and returns the image via http. 

**Note:** Each component belongs to an asset category, and there is a total of four categories. Each category is represented by a 4-digit number, and each category is concatinated together to make the 16-digit componentID. (The componentID is called a token's DNA in other projects, FYI.)

`0000` has special meaning, that there is no component for the asset category.

## Installation

https://www.npmjs.com/package/sharp

Install Node Packages

`npm install`

.env
```
INFURA_PROJECT_ID = 
INFURA_PROJECT_SECRET =
COMPONENTS_FOLDER_HASH = HASH-POINTING_TO_YOUR_COMPONENTS_FOLDER(ie QmRCv9weC5rDqDJioatWXCr8HcfgeG1T4HfmgXs1frQ7LG)
```

run the app
```
node app.js
```

 - Upload COMPONETS_FOLDER_HASH to IPFS and pin it (i did this manually using pinata.cloud)
   example: https://ipfs.io/ipfs/QmRCv9weC5rDqDJioatWXCr8HcfgeG1T4HfmgXs1frQ7LG


## Usage
### /make-avatar
` POST http://127.0.0.1:8000/make-avatar` ( will create avatar and pin to IPFS )

Using CURL:
`curl -X POST -H "content-type:application/json" -d '{ "data": { "id": "0033001200250005", "result": "0" }}' https://127.0.0.1:8000/make-avatar`

#### Response
```
{
    "jobRunId": "1",
    "statusCode": 200,
    "data": {
        "result": "QmfYtqtmQMqHumntuA2Ap8X8N9gQPWDfhWm5rjcueFzHp9"
    }
}
```

### /view-avatar
` GET http://127.0.0.1:8000/view-avatar` ( will create avatar return it )

Using CURL:
`curl -X GET https://127.0.0.1:8000/view-avatar/0054001100280005`

#### Response
`Content-Type: image/png`
(raw PNG image)

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.


## License

[MIT]([https://choosealicense.com/licenses/mit/](https://choosealicense.com/licenses/mit/))
