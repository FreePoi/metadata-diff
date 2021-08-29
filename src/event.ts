import { reduceDiff, getUpdate, filterUndefined } from './util';
import {
  EventItem,
  EventDiff,
  CallDiff,
  CallItem,
  CallItemArgs,
  Update,
  EventItemArgs,
} from './types';

export function getEventsDiff(
  preEvents: EventItem[] | null,
  events: EventItem[] | null,
): EventDiff[] | undefined {
  return reduceDiff<EventItem, EventDiff>(preEvents || [], events || [], {
    updateDiff: (pre, curr) => {
      let update:
        | {
            args: Update<EventItemArgs> | undefined;
          }
        | undefined = {
        args: getUpdate(pre.args, curr.args),
      };

      update = filterUndefined(update);

      return update
        ? {
            name: curr.name,
            update: update as {
              args: Update<EventItemArgs>;
            },
          }
        : undefined;
    },
  });
}
