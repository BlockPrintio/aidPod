import { Web3Storage, File } from 'web3.storage';
import fs from 'fs';

// Create web3.storage client using your API token
const token = process.env.WEB3_STORAGE; // store API token in .env
const client = new Web3Storage({ token });

/**
 * Upload a file buffer to IPFS and return its CID URI.
 * @param {Buffer|Uint8Array|Blob|ArrayBuffer} fileBuffer - The file content
 * @param {string} fileName - original filename
 * @returns {string} - ipfs://CID
 */
export async function uploadToIPFS(fileBuffer, fileName) {
  try {
    const file = new File([fileBuffer], fileName);
    const cid = await client.put([file]);
    return `ipfs://${cid}`;
  } catch (error) {
    throw new Error(`Failed to upload to IPFS: ${error.message}`);
  }
}

/**
 * Upload a file from disk to IPFS
 * @param {string} filePath - path to file on disk
 * @returns {string} - ipfs://CID
 */
export async function uploadFileToIPFS(filePath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = filePath.split('/').pop();
    return await uploadToIPFS(fileBuffer, fileName);
  } catch (error) {
    throw new Error(`Failed to upload file to IPFS: ${error.message}`);
  }
}

export default {
  uploadToIPFS,
  uploadFileToIPFS
};

