import {
  InsertOrDelType,
  StorageDiff,
  Storage,
  StorageItem,
  StorageItemDiff,
  StorageItemUpdate,
} from './types';
import { filterUndefined, getInsertOrDel, getUpdate, reduceDiff } from './util';

export function getStorageDiff(
  preStorage: Storage | null,
  storage: Storage | null,
): StorageDiff | undefined {
  let storageDiff: StorageDiff | undefined = {};

  storageDiff.insertOrDel = getInsertOrDel(preStorage, storage);
  storageDiff.prefix = getUpdate(preStorage?.prefix, storage?.prefix);
  storageDiff.update = reduceDiff<StorageItem, StorageItemDiff>(
    preStorage?.items || [],
    storage?.items || [],
    {
      updateDiff: (pre, curr) => {
        let update: StorageItemUpdate | undefined = {
          modifier: getUpdate(pre.modifier, curr.modifier),
          type: getUpdate(pre.type, curr.type),
          fallback: getUpdate(pre.fallback, curr.fallback),
        };

        update = filterUndefined(update as StorageItemUpdate);

        return update
          ? {
              name: curr.name,
              update,
            }
          : undefined;
      },
    },
  );

  storageDiff = filterUndefined(storageDiff);

  return storageDiff;
}
