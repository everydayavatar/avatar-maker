require("dotenv").config();

const ethers = require("ethers");

const abi = require("../constants/EverydayAvatar.json");

const contractAddress = process.env.CONTRACT_ADDRESS;
const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER_URL);
const signer = new ethers.Wallet(process.env.DEPLOYER_KEY, provider);

const contract = new ethers.Contract(contractAddress, abi, signer);

module.exports.checkTokenOwner = async (tokenId, address) => { 
    try {
        const owner = await contract.ownerOf(tokenId);
        if(owner){
            return owner.toLowerCase() === address.toLowerCase(); 
        }
    } catch (error) {
        console.error(error);
    }
    return false;
}

module.exports.checkIfIpfs = async (tokenId) => { 
    try {
        const tokenUri = await contract.tokenURI(tokenId);
        if(tokenUri){
            let tokenJson = Buffer.from(
                tokenUri.replace("data:application/json;base64,", ""),
                "base64"
              ).toString();
            if (tokenJson) {
                tokenJson = JSON.parse(tokenJson);
            }
            if(tokenJson.image && tokenJson.image.includes('ipfs')){
                return true;
            }
        }
    } catch (error) {
        console.error(error);
    }
    return false;
}

module.exports.updateCID = async(tokenId, hash)=>{
    try {
        //const gas = await contract.estimateGas.updateToIPFS(tokenId, hash);
        const txn = await contract.updateToIPFS(tokenId, hash)
        if(txn){
            return txn.hash;
        }
    } catch (error) {
        console.error(error);
    }
    return false;
}