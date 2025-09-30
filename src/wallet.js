// src/wallet.js
import { ethers } from "ethers";
import { MONAD, TOKEN_ADDRESS } from "./config";
import { ERC20_ABI } from "./abi";

export async function connectWalletNoForce() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask não encontrado");
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();
  const address = await signer.getAddress();

  const net = await provider.getNetwork();
  if (net.chainId !== MONAD.CHAIN_ID_DEC) {
    // não força troca — só informa; você pode exibir um aviso na UI
    return { provider, signer, address, wrongNetwork: true };
  }

  return { provider, signer, address, wrongNetwork: false };
}

export async function getERC20BalanceOrNative(address, provider) {
  if (!address || !provider) return { value: "0", symbol: MONAD.NATIVE.symbol, isNative: true };

  // se não configurou o contrato, cai pro saldo nativo
  if (!TOKEN_ADDRESS || TOKEN_ADDRESS === "0xYourTokenAddressOnMonad") {
    const wei = await provider.getBalance(address);
    return { value: ethers.utils.formatEther(wei), symbol: MONAD.NATIVE.symbol, isNative: true };
  }

  try {
    const token = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, provider);
    const [raw, dec, sym] = await Promise.all([
      token.balanceOf(address),
      token.decimals(),
      token.symbol(),
    ]);
    return { value: ethers.utils.formatUnits(raw, dec), symbol: sym, isNative: false };
  } catch (e) {
    // fallback nativo se o contrato falhar
    const wei = await provider.getBalance(address);
    return { value: ethers.utils.formatEther(wei), symbol: MONAD.NATIVE.symbol, isNative: true };
  }
}
