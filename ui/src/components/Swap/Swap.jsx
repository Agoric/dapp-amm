import { motion } from 'framer-motion';

import clsx from 'clsx';
import { useApplicationContext } from 'context/Application';
import AssetContext from 'context/AssetContext';
import {
  makeRatioFromAmounts,
  floorMultiplyBy,
  floorDivideBy,
  invertRatio,
} from '@agoric/zoe/src/contractSupport';
import { AmountMath } from '@agoric/ertp';
import { stringifyAmountValue } from '@agoric/ui-components';
import { parseAsNat } from '@agoric/ui-components/dist/display/natValue/parseAsNat';
import { Nat } from '@agoric/nat';
import { getInfoForBrand, displayPetname } from 'utils/helpers';
import { requestRatio, makeSwapOffer } from 'services/swap.service';
import { divide, multiply } from 'lodash';

import React, { useContext, useEffect, useState } from 'react';
import { FiChevronDown, FiChevronUp, FiRepeat, FiCheck } from 'react-icons/fi';
import { stringifyNat } from '@agoric/ui-components/dist/display/natValue/stringifyNat';
import ExtraInformation from './ExtraInformation/ExtraInformation';
import OptionsSwap from './OptionsSwap/OptionsSwap';
import SectionSwap from './SectionSwap/SectionSwap';

// decimal places to show in input
const PLACES_TO_SHOW = 2;

const Swap = () => {
  const [asset, setAsset] = useContext(AssetContext);
  const [optionsEnabled, setOptionsEnabled] = useState(false);
  const [error, setError] = useState(null);
  const [swapFrom, setSwapFrom] = useState({
    decimal: undefined,
    nat: 0n,
    limitDec: undefined,
    limitNat: 0n,
  });
  const [swapTo, setSwapTo] = useState({
    decimal: undefined,
    nat: 0n,
    limitDec: undefined,
    limitNat: 0n,
  });
  const [slippage, setSlippage] = useState(0.5);
  const [assetExchange, setAssetExchange] = useState(null);
  const [swapped, setSwapped] = useState(false);
  const assetExists = Object.values(asset).filter(item => item).length >= 2;

  // get state
  const { state, walletP } = useApplicationContext();

  const {
    brandToInfo,
    autoswap: { ammAPI, centralBrand },
  } = state;

  useEffect(() => {
    console.log(assetExchange);
  }, [assetExchange]);

  const makeInverseFromAmounts = (x, y) => makeRatioFromAmounts(y, x);
  const composeRatio = (x, y) =>
    makeRatioFromAmounts(floorMultiplyBy(x.numerator, y), x.denominator);

  const getExchangeRate = (placesToShow, marketRate, inputRate, outputRate) => {
    const giveInfo = getInfoForBrand(brandToInfo, inputRate.brand);
    const wantInfo = getInfoForBrand(brandToInfo, outputRate.brand);
    const oneDisplayUnit = 10n ** Nat(wantInfo.decimalPlaces);
    const wantPrice = floorDivideBy(
      AmountMath.make(outputRate.brand, oneDisplayUnit),
      marketRate,
    );
    const exchangeRate = stringifyAmountValue(
      wantPrice,
      giveInfo.assetKind,
      giveInfo.decimalPlaces,
      placesToShow,
    );

    setAssetExchange({
      give: { code: displayPetname(giveInfo.petname), giveInfo },
      want: {
        code: displayPetname(wantInfo.petname),
        wantInfo,
      },
      rate: exchangeRate,
      marketRate,
    });
  };

  /**
   * The `marketRate` is the ratio between the input asset
   * and the output asset. It is computed by getting the market
   * price for each pool, and composing them. If one of the
   * selected assets is the central token, that "poolRate"
   * is just 1:1 (centralOnlyRate, above).
   *
   * Becuase the ratios are queries async, the state for
   * them starts as `{ brand, amount: null }`. The brand is
   * used to check at `set` time that the brand has not changed;
   * e.g., because the user selected a purse with a different
   * brand.
   *
   * The input `poolRate` is `RUN/inputBrand` and the output
   * `poolRate` is `outputBrand/RUN`.
   */

  useEffect(() => {
    const getRates = async () => {
      let inputRate = null;
      asset.from &&
        (inputRate = await requestRatio(
          asset.from.brand,
          makeRatioFromAmounts,
          centralBrand,
          ammAPI,
        ));
      let outputRate = null;
      asset.to &&
        (outputRate = await requestRatio(
          asset.to.brand,
          makeInverseFromAmounts,
          centralBrand,
          ammAPI,
        ));

      const marketRate =
        inputRate?.ratio && outputRate?.ratio
          ? composeRatio(inputRate.ratio, outputRate.ratio)
          : null;

      marketRate && getExchangeRate(4, marketRate, inputRate, outputRate);
    };
    if ((asset.from || asset.to) && ammAPI) {
      getRates();
    }
  }, [asset, ammAPI, centralBrand]);

  useEffect(() => {
    Object.values(asset).filter(item => item).length >= 2 && setError(null);
  }, [asset]);

  useEffect(() => {
    if (swapFrom && swapTo) setError(null);

    if (asset?.from?.purse?.balance < swapFrom.decimal)
      setError(`Insufficient ${asset.from.code} balance`);
  }, [swapFrom, swapTo]);

  // If the user entered the "In" amount, then keep that fixed and
  // change the output by the slippage.
  const handleSwap = () => {
    if (!(swapFrom.decimal || swapTo.decimal)) {
      setError('Please add input first');
      return;
    } else if (Number(swapFrom.decimal) === 0 || Number(swapTo.decimal) === 0) {
      setError('Add value greater than zero');
      return;
    } else if (!swapTo.limitNat || !swapFrom.limitNat) {
      setError('Something went wrong while setting slippage');
      return;
    } else if (error) {
      return;
    }
    console.log(
      'FINAL VALUES: ',
      swapFrom.nat,
      swapTo.nat,
      'slippage adjusted: ',
      swapTo.limitNat,
    );
    makeSwapOffer(
      walletP,
      ammAPI,
      asset.from.purse,
      swapFrom.nat,
      asset.to.purse,
      swapTo.limitNat,
      true, // swapIn will always be true
    );

    setSwapped(true);
    setSwapFrom({ decimal: 0, nat: 0n });
    setSwapTo({ decimal: 0, nat: 0n });

    setTimeout(() => {
      setSwapped(false);
    }, 2000);
  };

  const handleInputChange = ({ target }) => {
    let newInput = target.value;
    if (newInput < 0) {
      newInput = 0;
    } else if (!newInput) {
      const reset = {
        decimal: undefined,
        nat: 0n,
        limitDec: undefined,
        limitNat: 0n,
      };
      setSwapFrom(reset);
      setSwapTo(reset);
      return;
    }

    // parse as Nat value
    const swapFromNat = parseAsNat(
      newInput,
      asset.from?.purse?.displayInfo?.decimalPlaces,
    );

    setSwapFrom({ decimal: newInput, nat: swapFromNat });
    // agoric stuff
    const amountMakeFrom = AmountMath.make(asset.from.brand, swapFromNat);

    // calculate swapTo price
    // multiply userInput 'from' amount to 'to' amount using provided rate.
    const swapToNat = floorMultiplyBy(amountMakeFrom, assetExchange.marketRate);
    // convert bigInt to int, seems extra but doing it for consistent decimal places
    const ToValString = stringifyNat(
      swapToNat.value,
      asset.to?.purse?.displayInfo?.decimalPlaces,
      PLACES_TO_SHOW,
    );

    // calculating slippage
    const slippagePerc = divide(slippage, 100);
    const decrement = multiply(newInput, slippagePerc);
    const lowerLimit = Number(ToValString) - decrement;

    let lowerLimitNat = 0n;

    if (lowerLimit < 0) {
      setError('Value too small, no room for slippage.');
      return;
    } else {
      lowerLimitNat = parseAsNat(
        lowerLimit.toString(),
        asset.to?.purse?.displayInfo?.decimalPlaces,
      );
    }
    setError(null);
    setSwapTo({
      decimal: ToValString,
      nat: swapToNat.value,
      limitDec: lowerLimit,
      limitNat: lowerLimitNat,
    });
  };

  const handleOutputChange = ({ target }) => {
    let newInput = target.value;
    if (newInput < 0) {
      newInput = 0;
    } else if (!newInput) {
      setSwapFrom({
        decimal: undefined,
        nat: 0n,
        limitDec: undefined,
        limitNat: 0n,
      });
      setSwapTo({
        decimal: undefined,
        nat: 0n,
        limitDec: undefined,
        limitNat: 0n,
      });
      return;
    }
    // parse as Nat value
    const swapToNat = parseAsNat(
      newInput,
      asset.to?.purse?.displayInfo?.decimalPlaces,
    );

    setSwapTo({ decimal: newInput, nat: swapToNat, limitDec: 0 });
    // agoric stuff
    const amountMakeTo = AmountMath.make(asset.to?.brand, swapToNat);

    // calculate swapFrom price
    // multiply userInput 'to' amount to 'from' amount using provided rate.
    const swapFromNat = floorMultiplyBy(
      amountMakeTo,
      invertRatio(assetExchange.marketRate),
    );
    // convert bigInt to int, seems extra but doing it for consistent decimal places
    const FromValString = stringifyNat(
      swapFromNat.value,
      asset.from?.purse?.displayInfo?.decimalPlaces,
      PLACES_TO_SHOW,
    );

    setError(null);
    setSwapFrom({ decimal: FromValString, nat: swapFromNat.value });
  };

  return (
    <motion.div
      layout
      className="flex flex-col p-4 shadow-red-light rounded-sm gap-4 w-screen max-w-lg relative  select-none"
    >
      <div className="flex justify-between items-center gap-8 ">
        <h1 className="text-2xl font-semibold">Swap</h1>
        <h3
          className="flex  items-center text-sm gap-2 p-1 text-gray-500 cursor-pointer hover:bg-gray-100 rounded-sm"
          onClick={() => {
            setOptionsEnabled(!optionsEnabled);
          }}
        >
          More options {optionsEnabled ? <FiChevronUp /> : <FiChevronDown />}
        </h3>
      </div>

      {optionsEnabled && (
        <OptionsSwap slippage={slippage} setSlippage={setSlippage} />
      )}

      <div className="flex flex-col gap-4 relative">
        <SectionSwap
          type="from"
          value={swapFrom.decimal}
          handleChange={handleInputChange}
          rateAvailable={!assetExchange?.rate}
        />

        <FiRepeat
          className="transform-gpu rotate-90 p-2 bg-alternative text-3xl absolute left-6  ring-4 ring-white position-swap-icon cursor-pointer hover:bg-alternativeDark"
          onClick={() => {
            setAsset({
              from: asset.to,
              to: asset.from,
            });
            setSwapFrom(swapTo);
            setSwapTo(swapFrom);
          }}
        />

        <SectionSwap
          type="to"
          value={swapTo.decimal}
          handleChange={handleOutputChange}
          rateAvailable={!assetExchange?.rate}
        />
      </div>

      {assetExists && assetExchange && (
        <ExtraInformation
          {...assetExchange}
          swapFrom={swapFrom}
          swapTo={swapTo}
        />
      )}

      <button
        className={clsx(
          'flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-xl  font-medium p-3  uppercase',
          (assetExists || swapped) && !error
            ? 'bg-primary hover:bg-primaryDark text-white'
            : 'text-gray-500',
        )}
        disabled={error}
        onClick={() => {
          if (Object.values(asset).filter(item => item).length < 2)
            setError('Please select assets first');
          else if (!(swapFrom && swapTo)) {
            setError('Please enter the amount first');
          } else if (swapped) {
            setError('Please wait!');
          } else {
            handleSwap();
          }
        }}
      >
        {swapped ? <FiCheck size={28} /> : 'swap'}
      </button>

      {error && (
        <motion.h3 layout className="text-red-600">
          {error}
        </motion.h3>
      )}
    </motion.div>
  );
};

export default Swap;
