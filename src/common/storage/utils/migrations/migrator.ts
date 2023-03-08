import cloneDeep from "lodash/cloneDeep";

import { getVersion, setVersion } from "./versions";
import { addLogEntry } from "./logger";

export type StateMigrationStep<O = any, N = any> = (old: O) => N | Promise<N>;

export interface CreateStateMigratorOptions {
  sensitive: boolean;
}

export function createStateMigrator<S>(topic: string, migrations: StateMigrationStep[], { sensitive }: CreateStateMigratorOptions) {
  const migrateIfNeeded = async (old: any): Promise<S> => {
    const oldVersion = await getVersion(topic);

    if (oldVersion === migrations.length) {
      return old;
    }

    if (oldVersion > migrations.length) {
      throw new Error("Received version is higher than expected");
    }

    const migratedAt = new Date().toISOString();
    const newVersion = migrations.length;

    const backup = sensitive ? undefined : cloneDeep(old);

    try {
      let migrated = old;

      for (let i = oldVersion; i < migrations.length; i++) {
        migrated = await Promise.resolve(migrations[i](cloneDeep(migrated)));
      }

      await addLogEntry(topic, { oldVersion, newVersion, migratedAt, sensitive, backup });

      await setVersion(topic, newVersion);

      return migrated;
    } catch (error) {
      console.error("State migration failed with error: ", error);

      throw new Error("Migration failed");
    }
  };

  const resetVersion = async () => {
    await setVersion(topic, migrations.length);
  };

  return { migrateIfNeeded, resetVersion };
}
