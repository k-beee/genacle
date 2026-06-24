'use client';

import { useCallback, useEffect, useState } from 'react';
import { CHAIN_ID } from '../lib/contract';

export interface WalletState {
  address: `0x${string}` | null;
  chainId: number | null;
  chainOk: boolean;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export function useWallet(): WalletState {
  const [address, setAddress] = useState<`0x${string}` | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [connecting, setConnecting] = useState(false);

  const getChain = useCallback(async (prov: any) => {
    try {
      const id = await prov.request({ method: 'eth_chainId' });
      setChainId(parseInt(String(id), 16));
    } catch {
      /* ignore */
    }
  }, []);

  const connect = useCallback(async () => {
    const ethereum = typeof window !== 'undefined' ? (window as any).ethereum : null;
    if (!ethereum) {
      alert('No Web3 wallet detected. Please install MetaMask or another extension.');
      return;
    }
    setConnecting(true);
    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        setAddress(accounts[0].toLowerCase());
      }
      await getChain(ethereum);
    } catch (e) {
      console.error(e);
    } finally {
      setConnecting(false);
    }
  }, [getChain]);

  const disconnect = useCallback(() => {
    setAddress(null);
  }, []);

  useEffect(() => {
    const ethereum = typeof window !== 'undefined' ? (window as any).ethereum : null;
    if (!ethereum) return;

    ethereum.request({ method: 'eth_accounts' }).then(async (accounts: string[]) => {
      if (accounts && accounts.length > 0) {
        setAddress(accounts[0].toLowerCase() as `0x${string}`);
      }
      await getChain(ethereum);
    });

    const handleAccounts = (accs: string[]) => {
      if (accs && accs.length > 0) {
        setAddress(accs[0].toLowerCase() as `0x${string}`);
      } else {
        setAddress(null);
      }
    };

    const handleChain = (hexId: string) => {
      setChainId(parseInt(hexId, 16));
    };

    ethereum.on('accountsChanged', handleAccounts);
    ethereum.on('chainChanged', handleChain);

    return () => {
      ethereum.removeListener('accountsChanged', handleAccounts);
      ethereum.removeListener('chainChanged', handleChain);
    };
  }, [getChain]);

  const chainOk = chainId === CHAIN_ID;

  return { address, chainId, chainOk, connecting, connect, disconnect };
}
