import { Web3Storage, File } from 'web3.storage';

// Create web3.storage client using your API token
const token = process.env.WEB3_STORAGE; // store API token in .env
export const ipfsClient = new Web3Storage({ token });

// Function to upload file to IPFS
/**
 * Upload a file buffer to IPFS and return its CID URI.
 * @param {Buffer|Uint8Array|Blob|ArrayBuffer} fileBuffer - The file content
 * @param {string} fileName - original filename
 * @returns {string} - ipfs://CID
 */
export async function uploadToIPFS(fileBuffer, fileName) {
  const file = new File([fileBuffer], fileName);
  const cid = await ipfsClient.put([file]);
  return `ipfs://${cid}`;
}