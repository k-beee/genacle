export const rulingLabel: Record<string, string> = {
  CLAIMANT_WIN: 'Claimant Win',
  RESPONDENT_WIN: 'Respondent Win',
  DISMISSED: 'Dismissed',
};

export const rulingColor: Record<string, string> = {
  CLAIMANT_WIN: 'text-emerald-700 dark:text-emerald-400 border-emerald-700/20 bg-emerald-50 dark:bg-emerald-950/20',
  RESPONDENT_WIN: 'text-amber-700 dark:text-amber-400 border-amber-700/20 bg-amber-50 dark:bg-amber-950/20',
  DISMISSED: 'text-zinc-600 dark:text-zinc-400 border-zinc-500/20 bg-zinc-50 dark:bg-zinc-900/20',
};

export const statusColor: Record<string, string> = {
  PENDING: 'text-indigo-600 border-indigo-600/20 bg-indigo-50 dark:bg-indigo-950/20',
  RESOLVED: 'text-emerald-600 border-emerald-600/20 bg-emerald-50 dark:bg-emerald-950/20',
};

export function shortAddress(addr: string): string {
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}
