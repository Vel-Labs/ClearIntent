import { stableTypedDataJson, type ClearIntentTypedData } from "../../../../../packages/signer-adapter/src";

export type PayloadPreviewViewModel = {
  title: "ClearIntent payload preview";
  primaryType: string;
  signer: string;
  executor: string;
  policyHash: string;
  typedDataJson: string;
  warnings: string[];
};

export function buildPayloadPreviewViewModel(typedData: ClearIntentTypedData): PayloadPreviewViewModel {
  return {
    title: "ClearIntent payload preview",
    primaryType: typedData.primaryType,
    signer: typedData.message.signer,
    executor: typedData.message.executor,
    policyHash: typedData.message.policyHash,
    typedDataJson: stableTypedDataJson(typedData),
    warnings: [
      "ClearIntent app preview only.",
      "Wallet-rendered field visibility requires operator-run evidence."
    ]
  };
}
