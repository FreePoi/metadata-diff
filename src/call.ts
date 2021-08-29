import { reduceDiff, getUpdate, filterUndefined } from './util';
import { CallItem, CallDiff, Update, CallItemArgs } from './types';

export function getCallsDiff(
  preCalls: CallItem[] | null,
  calls: CallItem[] | null,
): CallDiff[] | undefined {
  return reduceDiff<CallItem, CallDiff>(preCalls || [], calls || [], {
    updateDiff: (pre, curr) => {
      let update:
        | {
            args: Update<CallItemArgs> | undefined;
          }
        | undefined = {
        args: getUpdate(pre.args, curr.args),
      };

      update = filterUndefined(update);

      return update
        ? {
            name: curr.name,
            update: update as
              | {
                  args: Update<CallItemArgs>;
                }
              | undefined,
          }
        : undefined;
    },
  });
}
