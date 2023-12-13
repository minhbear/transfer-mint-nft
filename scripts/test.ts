import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { SPL_NOOP_PROGRAM_ID, ChangeLogEventV1, deserializeChangeLogEventV1 } from "@solana/spl-account-compression";
import { TransactionResponse, VersionedTransactionResponse, PublicKey } from "@solana/web3.js";

export function getAllChangeLogEventV1FromTransaction(
  txResponse: TransactionResponse | VersionedTransactionResponse,
  noopProgramId: PublicKey = SPL_NOOP_PROGRAM_ID
): ChangeLogEventV1[] {
  // ensure a transaction response was provided
  if (!txResponse) throw Error("No txResponse provided");

  // flatten the array of all account keys (e.g. static, readonly, writable)
  const accountKeys = txResponse.transaction.message
    .getAccountKeys()
    .keySegments()
    .flat();

  let changeLogEvents: ChangeLogEventV1[] = [];

  // locate and parse noop instruction calls via cpi (aka inner instructions)
  txResponse!.meta?.innerInstructions?.forEach((compiledIx) => {
    compiledIx.instructions.forEach((innerIx) => {
      // only attempt to parse noop instructions
      if (
        noopProgramId.toBase58() !==
        accountKeys[innerIx.programIdIndex].toBase58()
      )
        return;

      try {
        // try to deserialize the cpi data as a changelog event
        changeLogEvents.push(
          deserializeChangeLogEventV1(Buffer.from(bs58.decode(innerIx.data)))
        );
      } catch (__) {
        // this noop cpi is not a changelog event. do nothing with it.
      }
    });
  });

  return changeLogEvents;
}