import { StorageItemDiff, StorageItemUpdate } from './types';
import { InsertOrDelType, StorageDiff, Storage, StorageItem } from 'types';
import { filterUndefined, getInsertOrDel, getUpdate, reduceDiff } from 'diff';

export function getStorageDiff(
  preStorage: Storage | null,
  storage: Storage | null,
): StorageDiff | undefined {
  if (!preStorage || !storage) {
    return;
  }

  let storageDiff: StorageDiff | undefined = {};

  storageDiff.insertOrDel = getInsertOrDel(preStorage, storage);
  storageDiff.prefix = getUpdate(preStorage.prefix, storage.prefix);
  storageDiff.update = reduceDiff<StorageItem, StorageItemDiff>(
    preStorage.items,
    storage.items,
    item => ({
      name: item.name,
      insertOrDel: {
        type: InsertOrDelType.DEL,
        content: item,
      },
    }),
    item => ({
      name: item.name,
      insertOrDel: {
        type: InsertOrDelType.INSERT,
        content: item,
      },
    }),
    (pre, curr) => {
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
  );

  storageDiff = filterUndefined(storageDiff);

  return storageDiff;
}
