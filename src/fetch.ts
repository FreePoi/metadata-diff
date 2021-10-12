import { ApiRx, WsProvider } from '@polkadot/api';
import { mergeMap, tap, zip, catchError, of } from 'rxjs';
import fs from 'fs';
import blockHeights from './block-heights.json';

const domain = 'wss://rpc.polkadot.io';

const wsProvider = new WsProvider(domain);
const apiRx = new ApiRx({
  provider: wsProvider,
});

apiRx.on('ready', (api: ApiRx) => {
  console.log('API ready');
  let success = 0;

  const metadatas = blockHeights.map(height =>
    api.rpc.chain.getBlockHash(height).pipe(
      tap(blockHash =>
        console.log(
          `fetch metadata ${height}-${blockHash.toString().slice(0, 5)}`,
        ),
      ),
      mergeMap(blockHash => api.rpc.state.getMetadata(blockHash)),
      tap(() => console.log(`got metadata ${height}`)),
      tap(metadata =>
        fs.writeFile(
          `./output/${height}.json`,
          JSON.stringify(metadata.toJSON(), null, 2),
          () => (success += 1),
        ),
      ),
      catchError(() => {
        console.log(`fetch metadata ${height} failed`);
        return of();
      }),
    ),
  );

  zip(metadatas).subscribe(metadatas => {
    console.log(
      `Completed! ${success} succeed, ${blockHeights.length - success} failed`,
    );
    process.exit();
  });
});
