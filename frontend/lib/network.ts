/**
 * PayClear runs the same contract on two GenLayer networks. The page picks one from `?network=` (then the last choice,
 * then Bradbury), and switching reloads the page so every client, read and wallet check uses one network.
 */

export type NetworkId = "bradbury" | "studio";

export type Network = {
  id: NetworkId;
  label: string;
  short: string;
  chainId: number;
  chainName: string;
  /** RPC MetaMask sends transactions to. */
  rpc: string;
  /** RPC that answers contract reads (gen_call). On Bradbury this is a GenLayer node, not the chain RPC. */
  readRpc: string;
  explorer: string;
  contract: string;
  faucet: string;
  /** Studio rate-limits contract calls per IP; Bradbury does not. */
  rateLimited: boolean;
};

export const NETWORKS: Record<NetworkId, Network> = {
  bradbury: {
    id: "bradbury",
    label: "Bradbury testnet",
    short: "Bradbury",
    chainId: 4221,
    chainName: "GenLayer Bradbury Testnet",
    rpc: "https://rpc.testnet-chain.genlayer.com",
    readRpc: "https://rpc-bradbury.genlayer.com",
    explorer: "https://explorer-bradbury.genlayer.com",
    contract: process.env.NEXT_PUBLIC_BRADBURY_CONTRACT || "0x0000000000000000000000000000000000000000",
    faucet: "https://testnet-faucet.genlayer.foundation",
    rateLimited: false,
  },
  studio: {
    id: "studio",
    label: "GenLayer Studio",
    short: "Studio",
    chainId: 61999,
    chainName: "GenLayer Studio",
    rpc: "https://studio.genlayer.com/api",
    readRpc: "https://studio.genlayer.com/api",
    explorer: "https://explorer-studio.genlayer.com",
    contract: process.env.NEXT_PUBLIC_STUDIO_CONTRACT || "0x6dEc38B51C07120b910fe6b0a6c07b3Cf92A238D",
    faucet: "",
    rateLimited: true,
  },
};

const KEY = "payclear_network";
const isId = (v: unknown): v is NetworkId => v === "bradbury" || v === "studio";

export function networkFrom(param: string | null | undefined): NetworkId {
  return isId(param) ? param : "bradbury";
}

/** The page's network (browser only; the server renders Bradbury and the client corrects before any read). */
export function currentNetworkId(): NetworkId {
  if (typeof window === "undefined") return "bradbury";
  const fromUrl = new URLSearchParams(window.location.search).get("network");
  if (isId(fromUrl)) {
    try {
      localStorage.setItem(KEY, fromUrl);
    } catch {}
    return fromUrl;
  }
  try {
    const saved = localStorage.getItem(KEY);
    if (isId(saved)) return saved;
  } catch {}
  return "bradbury";
}

export const currentNetwork = (): Network => NETWORKS[currentNetworkId()];

export function switchNetwork(id: NetworkId) {
  try {
    localStorage.setItem(KEY, id);
  } catch {}
  const url = new URL(window.location.href);
  url.searchParams.set("network", id);
  url.hash = "";
  window.location.assign(url.toString());
}

export const txUrl = (n: Network, hash: string) => `${n.explorer}/tx/${hash}`;
export const addressUrl = (n: Network, address: string) => `${n.explorer}/address/${address}`;
