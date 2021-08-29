import { reduceDiff } from './util';
import { ErrorItem, ErrorDiff, Update } from './types';

export function getErrorsDiff(
  preErros: ErrorItem[],
  erros: ErrorItem[],
): ErrorDiff[] | undefined {
  return reduceDiff<ErrorItem, ErrorDiff>(preErros || [], erros || [], {
    updateDiff: () => {
      return undefined;
    },
  });
}
