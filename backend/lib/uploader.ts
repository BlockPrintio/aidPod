// @ts-ignore: Could not find module 'web3.storage' or its corresponding type declarations.
import { Web3Storage, File } from 'web3.storage';

// Create web3.storage client using your API token
const token = process.env.WEB3_STORAGE; // store API token in .env
const client = new Web3Storage({ token });

/**
 * Upload a file buffer to IPFS and return its CID URI.
 * @param {Buffer|Uint8Array|ArrayBuffer} fileBuffer - The file content
 * @param {string} fileName - original filename
 * @returns {Promise<string>} - ipfs://CID
 */
export async function uploadToIPFS(fileBuffer: Buffer | Uint8Array | ArrayBuffer, fileName: string): Promise<string> {
  try {
    const file = new File([fileBuffer], fileName);
    const cid = await client.put([file]);
    return `ipfs://${cid}`;
  } catch (error) {
    throw new Error(`Failed to upload to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Upload a file from disk to IPFS
 * @param {string} filePath - path to file on disk
 * @returns {Promise<string>} - ipfs://CID
 */
export async function uploadFileToIPFS(filePath: string): Promise<string> {
  try {
    const fs = await import('fs');
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = filePath.split('/').pop() || 'unknown';
    return await uploadToIPFS(fileBuffer, fileName);
  } catch (error) {
    throw new Error(`Failed to upload file to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export default {
  uploadToIPFS,
  uploadFileToIPFS
};

