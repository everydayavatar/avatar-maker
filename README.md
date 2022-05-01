


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