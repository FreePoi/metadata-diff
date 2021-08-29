import blockHeights from './block-heights.json';
import { ApiRx, WsProvider } from '@polkadot/api';
import { map, mergeMap, tap, zip } from 'rxjs';
import fs from 'fs';

console.log(blockHeights.length);
process.exit();
const domain = 'wss://polkadot.api.onfinality.io/public-ws';
const wsProvider = new WsProvider(domain);
const apiRx = new ApiRx({
  provider: wsProvider,
});

apiRx.on('ready', (api: ApiRx) => {
  console.log('ready');
  // api.rpc.state
  //   .getMetadata(
  //     '0x5cffdbe008ff378eb9b93817caa1bc9005a9391cf01ed21425c1e9b523c4cc38'
  //   )
  //   .subscribe(m => console.log('metadata', m.toJSON()));
  // return;
  const metadatas = blockHeights.map(height =>
    api.rpc.chain.getBlockHash(height).pipe(
      tap(blockHash => console.log('fetch metadata', blockHash.toString())),
      mergeMap(blockHash => api.rpc.state.getMetadata(blockHash)),
      tap(metadata => console.log(`got metadata ${height}`)),
      tap(metadata => {
        fs.writeFile(
          `./output/${height}.json`,
          JSON.stringify(metadata.toJSON(), null, 2),
          () => {},
        );
      }),
    ),
  );
  zip(metadatas).subscribe(metadatas => {
    console.log('completed');
    process.exit();
  });
});
