import { getCallsDiff } from './call';
import { getConstantsDiff } from './constant';
import { getErrorsDiff } from './error';
import { getEventsDiff } from './event';
import { getStorageDiff } from './storage';
import fs from 'fs';
import path from 'path';
import { DiffResult, Metadata, Module, ModuleDiff } from './types';
import { reduceDiff, getUpdate, filterUndefined } from './util';
import meta0 from '../output/0.json';
import meta1 from '../output/6321619.json';

function diff(preMeta: Metadata, meta: Metadata): DiffResult | undefined {
  const preVersion = Object.keys(preMeta.metadata)[0];
  const version = Object.keys(meta.metadata)[0];
  const result: DiffResult = { modules: [] };
  const preModules = preMeta.metadata[preVersion].modules;
  const currentModules = meta.metadata[version].modules;

  if (preVersion !== version) {
    result.version = { from: preVersion, to: version };
  }

  result.modules = reduceDiff<Module, ModuleDiff>(preModules, currentModules, {
    updateDiff: (pre, curr) => {
      const indexDiff = getUpdate(pre.index, curr.index);
      const storageDiff = getStorageDiff(pre.storage, curr.storage);
      const callsDiff = getCallsDiff(pre.calls, curr.calls);
      const eventsDiff = getEventsDiff(pre.events, curr.events);
      const constantsDiff = getConstantsDiff(pre.constants, curr.constants);
      const errorsDiff = getErrorsDiff(pre.errors, curr.errors);

      let diffModule: ModuleDiff | undefined = {
        name: curr.name,
        index: indexDiff,
        // storage: storageDiff,
        // calls: callsDiff,
        // events: eventsDiff,
        // constants: constantsDiff,
        errors: errorsDiff,
      };

      diffModule = filterUndefined(diffModule);

      return diffModule;
    },
  });

  return filterUndefined(result);
}

const result = diff(meta0, meta1);

fs.writeFile(
  path.resolve(__dirname, '../output/0-6321619.json'),
  JSON.stringify(result, null, 2),
  err => console.log('err', err),
);
