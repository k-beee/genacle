import { createClient } from 'genlayer-js';
import { testnetBradbury } from 'genlayer-js/chains';
import type { GenLayerClient } from 'genlayer-js/types';

export const CONTRACT_ADDRESS = '0xd23D6E7688942FeB5e58aca3f5700b98921E5ACe' as const;
export const EXPLORER = 'https://explorer-bradbury.genlayer.com';
export const FAUCET = 'https://testnet-faucet.genlayer.foundation/';
export const CHAIN_ID = 4221;

export type Ruling = 'CLAIMANT_WIN' | 'RESPONDENT_WIN' | 'DISMISSED' | '';

export interface Dispute {
  id: string;
  title: string;
  agreement: string;
  claimant_case: string;
  respondent_case: string;
  creator: string;
  status: 'PENDING' | 'RESOLVED';
  ruling: Ruling;
  confidence: number;
  rationale: string;
  resolver: string;
  index: number;
}

export interface Stats {
  disputes: number;
  resolved: number;
  claimant_wins: number;
  owner: string;
}

export const readClient: GenLayerClient<typeof testnetBradbury> = createClient({
  chain: testnetBradbury,
});

export function makeWalletClient(account: `0x${string}`) {
  return createClient({ chain: testnetBradbury, account } as Parameters<typeof createClient>[0]);
}

export async function withRpcRetry<T>(fn: () => Promise<T>, tries = 4): Promise<T> {
  let last: unknown;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (e) {
      last = e;
      if (!/rate limit|429|timeout|network|fetch|-32/i.test(String(e))) throw e;
      await new Promise((r) => setTimeout(r, 2500 * 2 ** i));
    }
  }
  throw last;
}

function pick(raw: unknown, k: string): unknown {
  if (raw instanceof Map) return raw.get(k);
  if (raw && typeof raw === 'object') return (raw as Record<string, unknown>)[k];
  return undefined;
}

function normalizeDispute(raw: unknown): Dispute {
  const r = String(pick(raw, 'ruling') ?? '').toUpperCase();
  const status = String(pick(raw, 'status') ?? 'PENDING').toUpperCase();
  return {
    id: String(pick(raw, 'id') ?? ''),
    title: String(pick(raw, 'title') ?? ''),
    agreement: String(pick(raw, 'agreement') ?? ''),
    claimant_case: String(pick(raw, 'claimant_case') ?? ''),
    respondent_case: String(pick(raw, 'respondent_case') ?? ''),
    creator: String(pick(raw, 'creator') ?? ''),
    status: status === 'RESOLVED' ? 'RESOLVED' : 'PENDING',
    ruling: (['CLAIMANT_WIN', 'RESPONDENT_WIN', 'DISMISSED'].includes(r) ? r : '') as Ruling,
    confidence: Number(pick(raw, 'confidence') ?? 0),
    rationale: String(pick(raw, 'rationale') ?? ''),
    resolver: String(pick(raw, 'resolver') ?? ''),
    index: Number(pick(raw, 'index') ?? 0),
  };
}

function normalizeStats(raw: unknown): Stats {
  return {
    disputes: Number(pick(raw, 'disputes') ?? 0),
    resolved: Number(pick(raw, 'resolved') ?? 0),
    claimant_wins: Number(pick(raw, 'claimant_wins') ?? 0),
    owner: String(pick(raw, 'owner') ?? ''),
  };
}

export async function fetchDisputes(contractAddr: string, start = 0): Promise<Dispute[]> {
  const res = await withRpcRetry(() =>
    readClient.readContract({
      address: contractAddr as `0x${string}`,
      functionName: 'get_disputes',
      args: [start],
    }),
  );
  return Array.isArray(res) ? res.map(normalizeDispute) : [];
}

export async function fetchStats(contractAddr: string): Promise<Stats> {
  const res = await withRpcRetry(() =>
    readClient.readContract({
      address: contractAddr as `0x${string}`,
      functionName: 'get_stats',
      args: [],
    }),
  );
  return normalizeStats(res);
}

export async function fileDispute(
  client: ReturnType<typeof makeWalletClient>,
  contractAddr: string,
  title: string,
  agreement: string,
  claimantCase: string,
  respondentCase: string,
): Promise<`0x${string}`> {
  return client.writeContract({
    address: contractAddr as `0x${string}`,
    functionName: 'file_dispute',
    args: [title, agreement, claimantCase, respondentCase],
    value: 0n,
  }) as Promise<`0x${string}`>;
}

export async function resolveDispute(
  client: ReturnType<typeof makeWalletClient>,
  contractAddr: string,
  disputeId: string,
  evidence: string,
): Promise<`0x${string}`> {
  return client.writeContract({
    address: contractAddr as `0x${string}`,
    functionName: 'resolve_dispute',
    args: [disputeId, evidence],
    value: 0n,
  }) as Promise<`0x${string}`>;
}
