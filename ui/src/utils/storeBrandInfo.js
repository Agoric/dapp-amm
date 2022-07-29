// @ts-check

import { assert } from '@agoric/assert';

import { mergeBrandToInfo } from '../store/store';

export const storePurseBrand = async ({
  dispatch,
  brandToInfo,
  brand,
  petname,
  displayInfo,
}) => {
  assert(brandToInfo);
  const decimalPlaces = displayInfo && displayInfo.decimalPlaces;
  const assetKind = displayInfo && displayInfo.assetKind;

  const newInfo = {
    petname,
    assetKind,
    decimalPlaces,
  };

  const newBrandToInfo = [[brand, newInfo]];
  dispatch(mergeBrandToInfo(newBrandToInfo));
  return newInfo;
};
