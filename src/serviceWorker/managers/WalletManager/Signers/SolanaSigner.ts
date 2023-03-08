import { Keypair, Transaction, SystemProgram } from "@solana/web3.js";
import { derivePath } from "ed25519-hd-key";
import * as bip39 from "bip39";
import * as bs58 from "bs58";
import nacl from "tweetnacl";

import { PrivateKeySignerStorageData, SolanaTransactionPayload, SignMessageData } from "common/types";
import { getSolanaSignerPath } from "common/wallet";

import { SignerFromMnemonicData, SignerFromPrivateKeyData, SignerSpecificAccountInfo, SignerSpecificStorageData } from "./types";
import { PrivateKeySigner } from "./PrivateKeySigner";

/**
 * This Private Key account manages a single private key, this is specifically for managing a Solana based account
 */
export class SolanaSigner extends PrivateKeySigner<"solana"> {
  #keypair: Keypair;

  constructor(storage: Omit<PrivateKeySignerStorageData, "type" | "chainType">) {
    super("solana", storage);

    try {
      this.#keypair = Keypair.fromSecretKey(bs58.decode(storage.privateKey));
    } catch {
      throw new Error("Invalid Private Key Provided");
    }
  }

  /**
   * `opts` should contain the recentBlockhash, which can only with a connected connection
   */
  public async signTransaction({ params, opts }: SolanaTransactionPayload): Promise<string> {
    const newTx = new Transaction(opts).add(SystemProgram.transfer(params));

    const transactionBuffer = newTx.serializeMessage();

    const signature = nacl.sign.detached(transactionBuffer, this.#keypair.secretKey);

    return Buffer.from(signature).toString("hex");
  }

  public async signMessage({ message }: SignMessageData): Promise<string> {
    const messageBytes = bs58.decode(message);
    const signature = nacl.sign.detached(messageBytes, this.#keypair.secretKey);

    return Buffer.from(signature).toString("hex");
  }

  public getPrivateKey() {
    return bs58.encode(this.#keypair.secretKey);
  }

  protected getSignerSpecificAccountInfo(): SignerSpecificAccountInfo<"private-key"> {
    return {};
  }

  protected getSignerSpecificStorageData(): SignerSpecificStorageData<"private-key"> {
    return { privateKey: this.getPrivateKey() };
  }

  /**
   * Based on the documentation here:
   * https://solanacookbook.com/references/keypairs-and-wallets.html#how-to-restore-a-keypair-from-a-mnemonic-phrase
   */
  static fromMnemonic({ mnemonic, accountNumber, alias, uuid }: SignerFromMnemonicData) {
    const path = getSolanaSignerPath(accountNumber);

    const solanaWalletSeed = bip39.mnemonicToSeedSync(mnemonic, "").toString("hex");

    const { publicKey, secretKey } = Keypair.fromSeed(derivePath(path, solanaWalletSeed).key);

    const address = publicKey.toString();
    const privateKey = bs58.encode(secretKey);

    return new SolanaSigner({ uuid, alias, address, privateKey });
  }

  static fromPrivateKey({ uuid, alias, privateKey }: SignerFromPrivateKeyData) {
    const { publicKey } = Keypair.fromSecretKey(bs58.decode(privateKey));

    const address = publicKey.toString();

    return new SolanaSigner({ uuid, alias, privateKey, address });
  }
}
