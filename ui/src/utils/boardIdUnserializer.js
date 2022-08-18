import { makeMarshal } from '@endo/marshal';

export const boardIdUnserializer = makeMarshal(undefined, slot => slot);
