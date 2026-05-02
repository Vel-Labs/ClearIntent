import type { WalletAccountState, WalletRequestEvidence } from "../../lib/wallet";

export type WalletStatusViewModel = {
  title: string;
  status: WalletAccountState["status"];
  provider: WalletAccountState["providerLabel"];
  accountLabel: string;
  chainLabel: string;
  evidenceLabel?: string;
};

export function buildWalletStatusViewModel(
  state: WalletAccountState,
  evidence?: WalletRequestEvidence
): WalletStatusViewModel {
  return {
    title: "Parent wallet",
    status: state.status,
    provider: state.providerLabel,
    accountLabel: state.account ?? "Not connected",
    chainLabel: state.chainId ? `Chain ${state.chainId}` : "No chain selected",
    evidenceLabel: evidence ? "EIP-712 request captured; wallet-rendered preview unproven" : undefined
  };
}
