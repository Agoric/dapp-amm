import { toast } from 'react-toastify';
import {
  stringifyRatioAsPercent,
  stringifyRatio,
  stringifyValue,
} from '@agoric/ui-components';
import { AssetKind } from '@agoric/ertp';
import agoricLogo from '../assets/crypto-icons/agoric-logo.png';
import bldLogo from '../assets/crypto-icons/bld-logo.png';
import kirkLogo from '../assets/crypto-icons/kirk-logo.png';
import usdcLogo from '../assets/crypto-icons/usdc-logo.png';
import atomLogo from '../assets/crypto-icons/atom-logo.png';
import placeHolderAgoric from '../assets/placeholder-agoric.png';

export const getLogoForBrandPetname = brandPetname => {
  // setting default image as agoric logo
  let image = placeHolderAgoric;
  switch (brandPetname) {
    case 'IST':
      image = agoricLogo;
      break;
    case 'BLD':
      image = bldLogo;
      break;
    case 'LINK':
      image = kirkLogo;
      break;
    case 'USDC':
      image = usdcLogo;
      break;
    case 'ATOM':
      image = atomLogo;
      break;
    default:
      break;
  }

  return image;
};

export const getPurseAssetKind = purse =>
  (purse && purse.displayInfo && purse.displayInfo.assetKind) || undefined;

export const getPurseDecimalPlaces = purse =>
  (purse && purse.displayInfo && purse.displayInfo.decimalPlaces) || undefined;

export const displayPetname = pn => (Array.isArray(pn) ? pn.join('.') : pn);

export const filterPursesByBrand = (purses, desiredBrand) =>
  purses.filter(({ brand }) => brand === desiredBrand);

export const comparePurses = (a, b) =>
  displayPetname(a.pursePetname) > displayPetname(b.pursePetname) ? 1 : -1;

export const sortPurses = purses => purses.sort(comparePurses);

export const getInfoForBrand = (brandToInfo, brand) => {
  const array = brandToInfo.find(([b]) => b === brand);
  if (array) {
    return array[1];
  }
  return undefined;
};

export const makeDisplayFunctions = brandToInfo => {
  const brandToInfoMap = new Map(brandToInfo);

  const getDecimalPlaces = brand => brandToInfoMap.get(brand)?.decimalPlaces;
  const getPetname = brand => brandToInfoMap.get(brand)?.petname;

  const displayPercent = (ratio, placesToShow) => {
    return stringifyRatioAsPercent(ratio, getDecimalPlaces, placesToShow);
  };

  const displayBrandPetname = brand => {
    return displayPetname(getPetname(brand));
  };

  const displayRatio = (ratio, placesToShow) => {
    return stringifyRatio(ratio, getDecimalPlaces, placesToShow);
  };

  const displayAmount = (amount, placesToShow) => {
    const decimalPlaces = getDecimalPlaces(amount.brand);
    return stringifyValue(
      amount.value,
      AssetKind.NAT,
      decimalPlaces,
      placesToShow,
    );
  };

  const displayBrandIcon = brand => getLogoForBrandPetname(getPetname(brand));

  return {
    displayPercent,
    displayBrandPetname,
    displayRatio,
    displayAmount,
    getDecimalPlaces,
    displayBrandIcon,
  };
};

export const setToast = (msg, type, properties) => {
  const defaultProperties = {
    position: 'top-right',
    hideProgressBar: false,
    closeOnClick: true,
    newestOnTop: true,
    pauseOnHover: false,
    draggable: false,
    progress: false,
    containerId: 'Information',
  };
  const toastProperties = properties || defaultProperties;
  switch (type) {
    case 'loading': {
      toast.loading(msg, { ...toastProperties });
      break;
    }
    case 'success': {
      toast.success(msg, {
        ...toastProperties,
      });
      break;
    }
    case 'warning': {
      toast.warning(msg, {
        ...toastProperties,
      });
      break;
    }
    case 'error': {
      toast.error(msg, {
        ...toastProperties,
      });
      break;
    }
    default:
  }
};
