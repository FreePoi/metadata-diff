export type Storage = {
  prefix: string;
  items: StorageItem[];
};

export type StorageItemType =
  | { plain: string }
  | {
      map: {
        hasher: string;
        key: string;
        value: string;
        linked: boolean;
      };
    }
  | {
      doubleMap: {
        hasher: string;
        key1: string;
        key2: string;
        value: string;
        key2Hasher: string;
      };
    };

export type StorageItem = {
  name: string;
  modifier: string;
  type: StorageItemType;
  fallback: string;
  docs: string[];
};

export type EventItemArgs = string[];

export type EventItem = {
  name: string;
  args: EventItemArgs;
  docs: string[];
};

export type CallItemArgs = {
  name: string;
  type: string;
}[];

export type CallItem = {
  name: string;
  args: CallItemArgs;
  docs: string[];
};

export type ConstantItem = {
  name: string;
  type: string;
  value: string;
  docs: string[];
};

export type ErrorItem = {
  name: string;
  docs: string[];
};

export type Module = {
  name: string;
  index?: number;
  storage: Storage | null;
  calls: CallItem[] | null;
  events: EventItem[] | null;
  constants: ConstantItem[];
  errors: ErrorItem[];
};

export type Metadata = {
  magicNumber: number;
  metadata: Record<
    string,
    {
      modules: Module[];
      extrinsic: {
        version: number;
        signedExtensions: string[];
      };
    }
  >;
};

export type Update<T> = {
  from: T | null | undefined;
  to: T | null | undefined;
};

export type InsertOrDel<T> = {
  type: InsertOrDelType;
  content: T;
};

export enum InsertOrDelType {
  INSERT = 'Insert',
  DEL = 'Del',
}

export type StorageItemUpdate = {
  modifier?: Update<string>;
  type?: Update<StorageItemType>;
  fallback?: Update<string>;
};

export type StorageItemDiff = {
  name: StorageItem['name'];
  insertOrDel?: InsertOrDel<StorageItem>;
  update?: StorageItemUpdate;
};

export type StorageDiff = {
  insertOrDel?: InsertOrDel<Storage | null>;
  prefix?: Update<string | undefined>;
  update?: StorageItemDiff[];
};

export type CallDiff = {
  name: CallItem['name'];
  insertOrDel?: InsertOrDel<CallItem>;
  update?: {
    args: Update<CallItemArgs>;
  };
};

export type EventDiff = {
  name: EventItem['name'];
  insertOrDel?: InsertOrDel<EventItem>;
  update?: {
    args: Update<EventItemArgs>;
  };
};

export type ConstantDiff = {
  name: ConstantItem['name'];
  insertOrDel?: InsertOrDel<ConstantItem>;
  update?: {
    type?: Update<string>;
    value?: Update<string>;
  };
};

export type ErrorDiff = {
  name: ErrorItem['name'];
  insertOrDel?: InsertOrDel<ErrorItem>;
};

export type ModuleDiff = {
  name: Module['name'];
  index?: Update<number | undefined>;
  insertOrDel?: InsertOrDel<Module>;
  storage?: StorageDiff;
  calls?: CallDiff[];
  events?: EventDiff[];
  constants?: ConstantDiff[];
  errors?: ErrorDiff[];
};

export type DiffResult = {
  version?: Update<string>;
  modules?: ModuleDiff[];
};
