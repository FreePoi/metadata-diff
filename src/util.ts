import { InsertOrDelType, Update, InsertOrDel } from './types';
import lodash from 'lodash';

export function getUpdate<T>(
  pre: T | null | undefined,
  curr: T | null | undefined,
): Update<T> | undefined {
  return !lodash.isEqual(pre, curr) ? { from: pre, to: curr } : undefined;
}

export function getInsertOrDel<T>(pre: T, curr: T): InsertOrDel<T> | undefined {
  if (pre && !curr) {
    return {
      type: InsertOrDelType.DEL,
      content: pre,
    };
  }

  if (!pre && curr) {
    return {
      type: InsertOrDelType.INSERT,
      content: curr,
    };
  }
}

export function filterUndefined<T>(
  record: Partial<Record<keyof T, any>>,
): Record<keyof T, any> | undefined {
  const entries = Object.entries(record).filter(([, value]) => !!value);

  if (!entries.length) {
    return undefined;
  }

  return Object.fromEntries(entries) as unknown as Record<keyof T, any>;
}

function defaultDelDiff<T extends { name: string }, F>(item: T): F {
  return {
    name: item.name,
    insertOrDel: {
      type: InsertOrDelType.DEL,
      content: item,
    },
  } as unknown as F;
}

function defaultAddDiff<T extends { name: string }, F>(item: T): F {
  return {
    name: item.name,
    insertOrDel: {
      type: InsertOrDelType.INSERT,
      content: item,
    },
  } as unknown as F;
}

export function reduceDiff<T extends { name: string }, F>(
  preItems: T[],
  currentItems: T[],
  phase: {
    delDiff?: (item: T) => F;
    addDiff?: (item: T) => F;
    updateDiff: (preItem: T, currentItem: T) => F | undefined;
  },
): F[] | undefined {
  const preItemsMap = Object.fromEntries(
    preItems.map(item => [item.name, item]),
  );
  const currentItemsMap = Object.fromEntries(
    currentItems.map(item => [item.name, item]),
  );
  const addedItems = currentItems.filter(({ name }) => !preItemsMap[name]);
  const updatedItems = currentItems.filter(({ name }) => preItemsMap[name]);
  const deletedItems = preItems.filter(({ name }) => !currentItemsMap[name]);

  const results: F[] = [];

  deletedItems.forEach(item =>
    results.push((phase.delDiff || defaultDelDiff)(item)),
  );
  addedItems.forEach(item =>
    results.push((phase.addDiff || defaultAddDiff)(item)),
  );
  updatedItems.forEach(item => {
    const updaton = phase.updateDiff(preItemsMap[item.name], item);

    updaton && results.push(updaton);
  });

  return results.length ? results : undefined;
}
