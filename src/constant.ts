import { reduceDiff, getUpdate, filterUndefined } from './util';
import { ConstantItem, ConstantDiff, Update } from './types';

export function getConstantsDiff(
  preConstants: ConstantItem[],
  constants: ConstantItem[],
): ConstantDiff[] | undefined {
  return reduceDiff<ConstantItem, ConstantDiff>(
    preConstants || [],
    constants || [],
    {
      updateDiff: (pre, curr) => {
        let update:
          | {
              type?: Update<string> | undefined;
              value?: Update<string> | undefined;
            }
          | undefined = {
          type: getUpdate(pre.type, curr.type),
          value: getUpdate(pre.value, curr.value),
        };

        update = filterUndefined(update);

        return update
          ? {
              name: curr.name,
              update,
            }
          : undefined;
      },
    },
  );
}
