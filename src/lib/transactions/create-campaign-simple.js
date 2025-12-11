import { MeshTxBuilder } from '@meshsdk/core';
import { provider } from '../mesh-config';

/**
 * Simple campaign creation transaction for testing
 * This creates a basic transaction without script complexity
 */
export async function buildSimpleCampaignTx(wallet, campaignData) {
  try {
    console.log('Building simple campaign creation transaction...');
    
    // 1) Gather wallet inputs
    const utxos = await wallet.getUtxos();
    const changeAddress = await wallet.getChangeAddress();
    
    console.log('Change Address:', changeAddress);
    console.log('Available UTxOs:', utxos.length);

    // 2) Build a simple transaction that just moves ADA
    // This proves the transaction building works without script complexity
    const txBuilder = new MeshTxBuilder({ fetcher: provider, verbose: true });
    
    const unsignedTx = await txBuilder
      .txOut(changeAddress, [
        { unit: 'lovelace', quantity: '1000000' } // 1 ADA
      ])
      .selectUtxosFrom(utxos)
      .changeAddress(changeAddress)
      .complete();

    console.log('✅ Simple transaction built successfully');
    return unsignedTx;
    
  } catch (error) {
    console.error('❌ Error building simple transaction:', error);
    throw new Error(`Simple transaction failed: ${error.message}`);
  }
}

/**
 * Test if wallet and provider are working correctly
 */
export async function testWalletConnection(wallet) {
  try {
    const address = await wallet.getChangeAddress();
    const utxos = await wallet.getUtxos();
    const balance = await wallet.getBalance();
    
    console.log('🔍 Wallet Test Results:');
    console.log('Address:', address);
    console.log('UTxOs:', utxos.length);
    console.log('Balance:', balance);
    
    return {
      isValid: true,
      address,
      utxoCount: utxos.length,
      balance
    };
  } catch (error) {
    console.error('❌ Wallet test failed:', error);
    return {
      isValid: false,
      error: error.message
    };
  }
}
