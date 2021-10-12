import { getCallsDiff } from './call';
import { getConstantsDiff } from './constant';
import { getErrorsDiff } from './error';
import { getEventsDiff } from './event';
import { getStorageDiff } from './storage';
import fs from 'fs';
import path from 'path';
import { DiffResult, Metadata, Module, ModuleDiff } from './types';
import { reduceDiff, getUpdate, filterUndefined } from './util';
import meta0 from '../output/5661442.json';
import meta1 from '../output/6321619.json';

function diff(preMeta: Metadata, meta: Metadata): DiffResult | undefined {
  const preVersion = Object.keys(preMeta.metadata)[0];
  const version = Object.keys(meta.metadata)[0];
  const result: DiffResult = { modules: [] };
  const preModules = preMeta.metadata[preVersion].modules;
  const currentModules = meta.metadata[version].modules;

  result.version = getUpdate(preVersion, version);

  result.modules = reduceDiff<Module, ModuleDiff>(preModules, currentModules, {
    updateDiff: (pre, curr) => {
      let diffModule: Partial<ModuleDiff> | undefined = {
        index: getUpdate(pre.index, curr.index),
        storage: getStorageDiff(pre.storage, curr.storage),
        calls: getCallsDiff(pre.calls, curr.calls),
        events: getEventsDiff(pre.events, curr.events),
        constants: getConstantsDiff(pre.constants, curr.constants),
        errors: getErrorsDiff(pre.errors, curr.errors),
      };

      diffModule = filterUndefined(diffModule);

      return diffModule ? { ...diffModule, name: curr.name } : undefined;
    },
  });

  return filterUndefined(result);
}

const result = diff(meta0, meta1);

fs.writeFile(
  path.resolve(__dirname, '../output/5661442-6321619.json'),
  JSON.stringify(result, null, 2),
  err => console.log('err', err),
);
