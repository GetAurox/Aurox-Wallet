import { PasswordManager } from "serviceWorker/managers";
import { SecurePasswordState } from "common/states";
import { Password } from "common/operations";

export async function setupPasswordService() {
  const manager = await new PasswordManager().initialize();

  const provider = SecurePasswordState.buildProvider({ hasPassword: manager.hasPassword, isPasswordVerified: manager.isPasswordVerified });

  Password.ChangePassword.registerResponder(async data => {
    await manager.change(data.oldPassword, data.newPassword);
  });

  Password.CreatePassword.registerResponder(async data => {
    await manager.create(data.newPassword);

    await provider.update(draft => {
      draft.hasPassword = true;
      draft.isPasswordVerified = true;
    });
  });

  Password.ProbePassword.registerResponder(async data => {
    return { valid: await manager.probe(data.password) };
  });

  Password.Authenticate.registerResponder(async data => {
    const verified = await manager.authenticate(data.password);

    if (verified) {
      await provider.update(draft => {
        draft.isPasswordVerified = true;
      });
    }

    return { verified };
  });

  Password.Lockdown.registerResponder(async () => {
    await manager.lock();
    await provider.update(draft => {
      draft.isPasswordVerified = false;
    });
  });

  return { manager, provider };
}
