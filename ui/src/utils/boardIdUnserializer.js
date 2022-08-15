import { makeMarshal } from '@endo/marshal';

export const unserializer = makeMarshal(undefined, slot => slot);
