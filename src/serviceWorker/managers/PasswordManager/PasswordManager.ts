import { TypedEmitter } from "tiny-typed-emitter";

import {
  memorizePasswordToWorkaroundSW5MinuteDeathmark,
  recallPasswordToWorkaroundSW5MinuteDeathmark,
  removePasswordToWorkaroundSW5MinuteDeathmark,
} from "common/chrome/workarounds/sw5MinuteDeathmark/sessionSecrets";

import { loadHashedPasswordFromLocalArea, saveHashedPasswordToLocalArea } from "common/storage";
import { hashPassword, verifyPassword } from "common/crypto";

import { PasswordMismatchError } from "./errors";

export interface PasswordManagerEvents {
  "password-verified": () => void;
  "password-created": () => void;
  "password-ready": () => void;
  "password-changed": (oldPassword: string) => void;
  "password-lockdown": () => void;
}

export class PasswordManager extends TypedEmitter<PasswordManagerEvents> {
  private _initialized = false;

  private _hasPassword = false;

  private _hash: string | null = null;
  private _salt: string | null = null;

  private _password: string | null = null;

  public get hasPassword() {
    if (!this._initialized) {
      throw new Error("Password manager is not initialized yet!");
    }

    return this._hasPassword;
  }

  public get isPasswordVerified() {
    if (!this._initialized) {
      throw new Error("Password manager is not initialized yet!");
    }

    return this._password !== null;
  }

  public async initialize() {
    const result = await loadHashedPasswordFromLocalArea();

    if (result) {
      this._hasPassword = true;

      this._hash = result.hash;
      this._salt = result.salt;

      this._password = await recallPasswordToWorkaroundSW5MinuteDeathmark();
    }

    this._initialized = true;

    return this;
  }

  public async lock() {
    this._password = null;
    await removePasswordToWorkaroundSW5MinuteDeathmark();

    this.emit("password-lockdown");
  }

  public async create(newPassword: string) {
    if (!this._initialized) {
      throw new Error("Password manager is not initialized yet!");
    }

    const { hash, salt } = await hashPassword(newPassword);

    await saveHashedPasswordToLocalArea(hash, salt);

    this._hasPassword = true;

    this._hash = hash;
    this._salt = salt;

    this._password = newPassword;

    await memorizePasswordToWorkaroundSW5MinuteDeathmark(newPassword);

    this.emit("password-created");
    this.emit("password-ready");
  }

  public async probe(password: string) {
    if (!this._initialized) {
      throw new Error("Password manager is not initialized yet!");
    }

    if (!this._hasPassword || !this._hash || !this._salt) {
      throw new Error("Password is not created yet!");
    }

    return await verifyPassword(this._hash, this._salt, password);
  }

  public async authenticate(password: string) {
    if (!this._initialized) {
      throw new Error("Password manager is not initialized yet!");
    }

    if (!this._hasPassword || !this._hash || !this._salt) {
      throw new Error("Password is not created yet!");
    }

    const result = await verifyPassword(this._hash, this._salt, password);

    if (result) {
      this._password = password;

      await memorizePasswordToWorkaroundSW5MinuteDeathmark(password);

      this.emit("password-verified");
      this.emit("password-ready");
    }

    return result;
  }

  public async change(oldPassword: string, newPassword: string) {
    if (!this._initialized) {
      throw new Error("Password manager is not initialized yet!");
    }

    if (!this._hasPassword) {
      throw new Error("Password is not created yet!");
    }

    if (this._password !== oldPassword) {
      throw new Error("Current password is incorrect");
    }

    const { hash, salt } = await hashPassword(newPassword);

    await saveHashedPasswordToLocalArea(hash, salt);

    this._hash = hash;
    this._salt = salt;

    this._password = newPassword;

    await memorizePasswordToWorkaroundSW5MinuteDeathmark(newPassword);

    this.emit("password-changed", oldPassword);
  }

  public usePassword<T = void>(usage: (password: string) => T): T {
    if (!this._initialized) {
      throw new Error("Password manager is not initialized yet!");
    }

    if (!this._hasPassword) {
      throw new Error("Password is not created yet!");
    }

    if (this._password === null) {
      throw new Error("Password is not verified yet!");
    }

    return usage(this._password);
  }

  /**
   * throws a PasswordMismatchError error if the provided password does not match the actual password.
   * Used for validation before usage of passwords provided by the external contexts such as popup.
   */
  public throwOnMissmatch(passwordToVerify: string) {
    if (!this._initialized) {
      throw new Error("Password manager is not initialized yet!");
    }

    if (!this._hasPassword) {
      throw new Error("Password is not created yet!");
    }

    if (this._password === null) {
      throw new Error("Password is not verified yet!");
    }

    if (this._password !== passwordToVerify) {
      throw new PasswordMismatchError("The provided password does not match the actual password");
    }
  }
}
