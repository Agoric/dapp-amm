import PoolContext from 'context/PoolContext';
import { v4 } from 'uuid';
import { motion } from 'framer-motion';

import { FiPlus } from 'react-icons/fi';
import React, { useContext, useEffect, useState } from 'react';
import clsx from 'clsx';

import { addLiquidityService, requestRatio } from 'services/liquidity.service';

import {
  makeRatioFromAmounts,
  floorMultiplyBy,
  floorDivideBy,
  invertRatio,
} from '@agoric/zoe/src/contractSupport';
import AssetContext from 'context/AssetContext';
import { useApplicationContext } from 'context/Application';

import { assetState } from 'utils/constant';
import { parseAsNat } from '@agoric/ui-components/dist/display/natValue/parseAsNat';
import { Nat } from '@agoric/nat';
import { AmountMath } from '@agoric/ertp';
import { stringifyAmountValue } from '@agoric/ui-components';

import { stringifyNat } from '@agoric/ui-components/dist/display/natValue/stringifyNat';
import { getInfoForBrand, displayPetname } from 'utils/helpers';

import CentralAssetLiquidity from '../SectionLiquidity/CentralAssetLiquidity';
import SecondaryAssetLiquidity from '../SectionLiquidity/SecondaryAssetLiquidity';
import RateLiquidity from '../RateLiquidity/RateLiquidity';

// used for indicating user's input type
const SWAP_IN = 'IN';
const SWAP_OUT = 'OUT';

// decimal places to show in input
const PLACES_TO_SHOW = 2;

const AddLiquidity = () => {
  const [centralValue, setCentralValue] = useState({
    decimal: undefined,
    nat: 0n,
    amountMake: undefined,
  });
  const [secondaryValue, setSecondaryValue] = useState({
    decimal: undefined,
    nat: 0n,
    amountMake: undefined,
  });
  const [assetExchange, setAssetExchange] = useState(null);
  const [error, setError] = useState(null);
  const [asset, setAsset] = useContext(AssetContext);
  const [pool, setPool] = useContext(PoolContext);
  const [inputType, setInputType] = useState(SWAP_IN);

  // get state
  const { state, walletP } = useApplicationContext();

  const {
    brandToInfo,
    autoswap: { ammAPI, centralBrand },
    purses,
  } = state;

  const assetExists =
    Object.values(asset).filter(item => item?.purse).length >= 2;

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

  const getRates = async () => {
    console.log('GETTING RATES', asset);
    let inputRate = null;
    asset.central &&
      asset.central?.brand &&
      (inputRate = await requestRatio(
        asset.central.brand,
        makeRatioFromAmounts,
        centralBrand,
        ammAPI,
      ));
    let outputRate = null;
    asset.secondary &&
      (outputRate = await requestRatio(
        asset.secondary.brand,
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

  useEffect(() => {
    if (asset.central && asset.secondary && ammAPI) {
      getRates();
    }
  }, [asset, ammAPI, centralBrand]);

  useEffect(() => {
    if (centralValue && secondaryValue) setError(null);
    if (asset.central?.purse.balance < centralValue.decimal)
      setError(`Insufficient ${asset.central.code} balance`);
    else if (asset.secondary?.purse.balance < secondaryValue.decimal)
      setError(`Insufficient ${asset.secondary.code} balance`);
    else setError(null);
  }, [centralValue, secondaryValue]);

  useEffect(() => {
    Object.values(asset).filter(item => item?.purse).length >= 2 &&
      setError(null);
    if (asset.central?.mode === assetState.EMPTY) {
      setError(assetState.EMPTY);
    } else setError(null);
  }, [asset]);

  const handleInputChange = ({ target }) => {
    let newInput = target.value;
    if (newInput < 0) {
      newInput = 0;
    } else if (!newInput) {
      const reset = {
        decimal: undefined,
        nat: 0n,
      };
      setCentralValue(reset);
      setSecondaryValue(reset);
      return;
    }
    // parse as Nat value
    const centralValueNat = parseAsNat(
      newInput,
      asset.central?.purse.displayInfo?.decimalPlaces,
    );

    // agoric stuff
    const amountMakeCentral = AmountMath.make(
      asset.central.brand,
      centralValueNat,
    );

    setCentralValue({
      decimal: newInput,
      nat: centralValueNat,
      amountMake: amountMakeCentral, // used for adding liquidity
    });
    setInputType(SWAP_IN);
    // calculate swapTo price
    // multiply userInput 'from' amount to 'to' amount using provided rate.
    const amountMakeSecondary = floorMultiplyBy(
      amountMakeCentral,
      assetExchange.marketRate,
    );

    // convert bigInt to int, seems extra but doing it for consistent decimal places
    const secondaryValString = stringifyNat(
      amountMakeSecondary.value,
      asset.secondary?.purse?.displayInfo?.decimalPlaces,
      PLACES_TO_SHOW,
    );

    setSecondaryValue({
      decimal: secondaryValString,
      nat: amountMakeSecondary.value,
      amountMake: amountMakeSecondary, // used for adding liquidity
    });
  };

  const handleOutputChange = ({ target }) => {
    let newInput = target.value;
    if (newInput < 0) {
      newInput = 0;
    } else if (!newInput) {
      const reset = {
        decimal: undefined,
        nat: 0n,
      };
      setCentralValue(reset);
      setSecondaryValue(reset);
      return;
    }

    // parse as Nat value
    const secondaryValueNat = parseAsNat(
      newInput,
      asset.secondary?.purse.displayInfo?.decimalPlaces,
    );
    // agoric stuff
    const amountMakeLiquidity = AmountMath.make(
      asset.secondary.brand,
      secondaryValueNat,
    );

    setSecondaryValue({
      decimal: newInput,
      nat: secondaryValueNat,
      amountMake: amountMakeLiquidity,
    });
    setInputType(SWAP_OUT);

    // calculate swapTFrom price
    // multiply userInput 'from' amount to 'to' amount using provided rate.
    const amountMakeCentral = floorMultiplyBy(
      amountMakeLiquidity,
      invertRatio(assetExchange.marketRate),
    );

    // convert bigInt to int, seems extra but doing it for consistent decimal places
    const CentralValString = stringifyNat(
      amountMakeCentral.value,
      asset.central?.purse?.displayInfo?.decimalPlaces,
      PLACES_TO_SHOW,
    );
    setError(null);
    setCentralValue({
      decimal: CentralValString,
      nat: amountMakeCentral.value,
      amountMake: amountMakeCentral,
    });
  };

  const handleAddLiquidity = () => {
    addLiquidityService(
      centralValue.amountMake,
      asset.central?.purse,
      secondaryValue.amountMake,
      asset.secondary?.purse,
      ammAPI,
      walletP,
      purses,
    );
  };

  return (
    <motion.div
      className="flex flex-col gap-4"
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col gap-4 relative">
        <CentralAssetLiquidity
          type="central"
          value={centralValue.decimal}
          handleChange={handleInputChange}
        />

        <FiPlus className="transform-gpu rotate-90 p-2 bg-alternative text-3xl absolute left-6  ring-4 ring-white position-swap-icon-liquidity" />

        <SecondaryAssetLiquidity
          disabled={error === assetState.EMPTY}
          type="secondary"
          value={secondaryValue.decimal}
          handleChange={handleOutputChange}
        />
      </div>
      {assetExists && assetExchange && (
        <RateLiquidity
          {...assetExchange}
          central={asset.central}
          secondary={asset.secondary}
        />
      )}

      <button
        className={clsx(
          'bg-gray-100 hover:bg-gray-200 text-xl  font-medium p-3  uppercase',
          assetExists
            ? 'bg-primary hover:bg-primaryDark text-white'
            : 'text-gray-500',
        )}
        disabled={error === assetState.EMPTY}
        onClick={() => {
          if (!assetExists) setError('Please select assets first');
          else if (!(secondaryValue && centralValue)) {
            setError('Please enter the amounts first');
          } else {
            handleAddLiquidity();
          }
        }}
      >
        ADD LIQUIDITY
      </button>

      {error && (
        <h3 className="text-red-600">
          {error === assetState.EMPTY ? (
            <div>
              RUN is required to add liquidity.{' '}
              <a href="" target="_blank" className="font-bold underline">
                Get RUN
              </a>{' '}
            </div>
          ) : (
            error
          )}
        </h3>
      )}
    </motion.div>
  );
};

export default AddLiquidity;
