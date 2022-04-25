


## Installation
Install ImageMagick 

https://github.com/aheckmann/gm



install prerequisites for merge-canvas lib

https://www.npmjs.com/package/canvas   

`OS X	Using Homebrew:
brew install pkg-config cairo pango libpng jpeg giflib librsvg`

`Ubuntu	sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev`

Install Node Packages

`npm install`

.env
```
INFURA_PROJECT_ID=
INFURA_PROJECT_SECRET=
```

run the app
```
node app.js
```

 - First i uploded the everday-avatar folder on pinata pinned it to ipfs(i did this manually)
   https://ipfs.io/ipfs/Qmdyoz3BQH3SphYABMQMSKHLFo9kswtrpuPcxmP7FvY1yK
 - Next i used gm(ImageMagick) to fetch the components from ipfs and overlap the images to create the avatar. For some reason gm was not fetching from https. so i first download the images locally and then pass it to gm(ImageMagick).
 - gm was slow as i download and then delete the files and stuff
 - So i used the merge-images library to create-avatar (https://www.npmjs.com/package/merge-images)


## Demo

`http://127.0.0.1:8000/make-avatar?gm=false`

gm=false will create-avatar with merge-images lib. if gm is not passed it will by default use gm(ImageMagick) to compose images.


req-body [refer everyday-avatar dir]
```
{
    "cid":"Qmdyoz3BQH3SphYABMQMSKHLFo9kswtrpuPcxmP7FvY1yK",
    "head":"hair",
    "face":"glasses",
    "clothes":"jacket"
}

```

```
{
    "cid":"Qmdyoz3BQH3SphYABMQMSKHLFo9kswtrpuPcxmP7FvY1yK",
    "head":"santacap",
    "face":"mask",
    "clothes":"formals"
}

```