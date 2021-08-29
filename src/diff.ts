import { getCallsDiff } from 'call';
import { getConstantsDiff } from 'constant';
import { getErrorsDiff } from 'error';
import { getEventsDiff } from 'event';
import { getStorageDiff } from 'storage';
import {
  DiffResult,
  InsertOrDel,
  InsertOrDelType,
  Metadata,
  ModuleDiff,
  Update,
} from 'types';
import meta0 from '../output/0.json';
import meta1 from '../output/6321619.json';

function diff(preMeta: Metadata, meta: Metadata) {
  const preVersion = Object.keys(preMeta.metadata)[0];
  const version = Object.keys(meta.metadata)[0];
  const result: DiffResult = { modules: [] };
  const preModules = preMeta.metadata[preVersion].modules;
  const currentModules = meta.metadata[version].modules;

  if (preVersion !== version) {
    result.version = { from: preVersion, to: version };
  }

  result.modules = reduceDiff(
    preModules,
    currentModules,
    module => ({
      name: module.name,
      insertOrDel: {
        type: InsertOrDelType.DEL,
        content: module,
      },
    }),
    module => ({
      name: module.name,
      insertOrDel: {
        type: InsertOrDelType.INSERT,
        content: module,
      },
    }),
    (pre, curr) => {},
  );

  // const preModulesMap = Object.fromEntries(
  //   preModules.map(module => [module.name, module]),
  // );
  // const currentModulesMap = Object.fromEntries(
  //   currentModules.map(module => [module.name, module]),
  // );
  // const addedModules = currentModules.filter(
  //   ({ name: currentModuleName }) => !preModulesMap[currentModuleName],
  // );
  // const updatedModules = currentModules.filter(
  //   ({ name: currentModuleName }) => preModulesMap[currentModuleName],
  // );
  // const deletedModules = preModules.filter(
  //   ({ name: preModuleName }) => !currentModulesMap[preModuleName],
  // );

  // deletedModules.forEach(module =>
  //   result.modules.push({
  //     name: module.name,
  //     insertOrDel: {
  //       type: InsertOrDelType.DEL,
  //       content: module,
  //     },
  //   }),
  // );

  // addedModules.forEach(module =>
  //   result.modules.push({
  //     name: module.name,
  //     insertOrDel: {
  //       type: InsertOrDelType.INSERT,
  //       content: module,
  //     },
  //   }),
  // );

  updatedModules.forEach(module => {
    const indexDiff = getUpdate(preModulesMap[module.name].index, module.index);
    const storageDiff = getStorageDiff(
      preModulesMap[module.name].storage,
      module.storage,
    );
    const callsDiff = getCallsDiff(
      preModulesMap[module.name].calls,
      module.calls,
    );
    const eventsDiff = getEventsDiff(
      preModulesMap[module.name].events,
      module.events,
    );
    const constantsDiff = getConstantsDiff(
      preModulesMap[module.name].constants,
      module.constants,
    );
    const errorsDiff = getErrorsDiff(
      preModulesMap[module.name].errors,
      module.errors,
    );

    if (
      !indexDiff &&
      !storageDiff &&
      !callsDiff &&
      !eventsDiff &&
      !constantsDiff &&
      !errorsDiff
    ) {
      return;
    }

    let diffModule: ModuleDiff = {
      name: module.name,
      index: indexDiff,
      storage: storageDiff,
      calls: callsDiff,
      events: eventsDiff,
      constants: constantsDiff,
      errors: errorsDiff,
    };

    diffModule = Object.fromEntries(
      Object.entries(diffModule).filter(([, value]) => value),
    ) as ModuleDiff;

    result.modules.push(diffModule);
  });
}

diff(meta0, meta1);

function getIndexDiff(
  preIndex: number | undefined,
  index: number | undefined,
): Update<number | undefined> | undefined {
  if (preIndex !== index) {
    return { from: preIndex, to: index };
  }
}

export function getUpdate<T>(pre: T, curr: T): Update<T> | undefined {
  return pre !== curr ? { from: pre, to: curr } : undefined;
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
): Partial<Record<keyof T, any> | undefined> {
  const entries = Object.entries(record).filter(([, value]) => !!value);

  if (!entries.length) {
    return undefined;
  }

  return Object.fromEntries(entries) as unknown as Partial<
    Record<keyof T, any>
  >;
}

export function reduceDiff<T extends { name: string }, F>(
  preItems: T[],
  currentItems: T[],
  delDiff: (item: T) => F,
  addDiff: (item: T) => F,
  updateDiff: (preItem: T, currentItem: T) => F | undefined,
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

  deletedItems.forEach(item => results.push(delDiff(item)));
  addedItems.forEach(item => results.push(addDiff(item)));
  updatedItems.forEach(item => {
    const updaton = updateDiff(preItemsMap[item.name], item);
    updaton && results.push(updaton);
  });

  return results.length ? results : undefined;
}
