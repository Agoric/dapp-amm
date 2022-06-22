import { motion } from 'framer-motion';
import Loader from 'react-loader-spinner';
import { toast } from 'react-toastify';
import clsx from 'clsx';
import { useApplicationContext } from 'context/Application';
import React, { useContext } from 'react';
import { makeDisplayFunctions } from 'utils/helpers';
import { makeSwapOffer } from 'services/swap.service';
import { FiChevronDown, FiChevronUp, FiRepeat, FiCheck } from 'react-icons/fi';
import { BiErrorCircle } from 'react-icons/bi';
import { makeEstimator } from '@agoric/run-protocol/src/vpool-xyk-amm/estimate';
import CustomLoader from 'components/components/CustomLoader';
import SwapContext, {
  Errors,
  defaultToastProperties,
} from 'context/SwapContext';
import ExtraInformation from './ExtraInformation/ExtraInformation';
import OptionsSwap from './OptionsSwap/OptionsSwap';
import SectionSwap from './SectionSwap/SectionSwap';

const Swap = () => {
  const {
    fromBrand,
    toBrand,
    fromPurse,
    toPurse,
    setToPurseId,
    setFromPurseId,
    setFromBrand,
    setToBrand,
    fromAmount,
    toAmount,
    slippage,
    setToastId,
    errors,
    addError,
    setCurrentOfferId,
    setSwapped,
    setToAmount,
    setFromAmount,
    setLastUserInput,
    setOptionsEnabled,
    optionsEnabled,
    swapped,
    setSlippage,
    swapButtonStatus,
    handleFromValueChange,
    handleToValueChange,
    exchangeRate,
  } = useContext(SwapContext);

  const { state, walletP } = useApplicationContext();
  const {
    walletOffers,
    autoswap,
    purses,
    liquidityBrands,
    poolStates,
    brandToInfo,
  } = state;
  const { ammAPI, poolBrands, centralBrand, poolFee, protocolFee } =
    autoswap ?? {};
  makeDisplayFunctions(brandToInfo);
  const poolCount = poolBrands?.length;
  const assetsLoaded =
    centralBrand &&
    poolBrands &&
    purses &&
    liquidityBrands.size === poolCount &&
    poolStates.size === poolCount;

  const calcReceiveAtLeast = slippageToUse => {
    if (!fromAmount || !toAmount || !fromBrand || !toBrand) return null;

    if (slippageToUse < 0.1 || slippageToUse > 5) {
      slippageToUse = 0.5;
    }
    const slippageBP = BigInt(Math.floor(slippageToUse * 100));
    const estimator = makeEstimator(centralBrand, {
      poolFeeBP: poolFee,
      protocolFeeBP: protocolFee,
      slippageBP,
    });
    return estimator.estimateProceeds(fromAmount, toBrand, poolStates);
  };

  const receiveAtLeast = calcReceiveAtLeast(slippage);

  const handleSwap = () => {
    setToastId(
      toast('Please approve the offer in your wallet.', {
        ...defaultToastProperties,
        type: toast.TYPE.INFO,
        progress: undefined,
        hideProgressBar: true,
        autoClose: false,
      }),
    );
    setCurrentOfferId(walletOffers.length);
    setSwapped(true);
    makeSwapOffer(
      walletP,
      ammAPI,
      fromPurse,
      fromAmount.value,
      toPurse,
      receiveAtLeast.value,
    );
  };

  const switchToAndFrom = () => {
    setToAmount(null);
    setFromAmount(null);
    setLastUserInput(null);
    setToBrand(fromBrand);
    setFromBrand(toBrand);
    setToPurseId(fromPurse?.pursePetname);
    setFromPurseId(toPurse?.pursePetname);
  };

  const errorsToRender = [];
  errors.forEach(e => {
    errorsToRender.push(
      <motion.h3 key={e} layout className="text-red-600">
        {e}
      </motion.h3>,
    );
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, boxShadow: 'none' }}
      animate={{
        opacity: 1,
        boxShadow: '0px 0px 99px var(--color-secondary)',
      }}
      transition={{ duration: 0.4 }}
      className="flex flex-col p-4 rounded-sm gap-4 w-screen max-w-lg relative select-none overflow-hidden"
    >
      <motion.div className="flex justify-between items-center gap-8 " layout>
        <h1 className="text-2xl font-semibold">Swap</h1>
        <h3
          className="flex  items-center text-sm gap-2 p-1 text-gray-500 cursor-pointer hover:bg-gray-100 rounded-sm"
          onClick={() => {
            setOptionsEnabled(!optionsEnabled);
          }}
        >
          More options {optionsEnabled ? <FiChevronUp /> : <FiChevronDown />}
        </h3>
      </motion.div>
      {optionsEnabled && (
        <OptionsSwap slippage={slippage} setSlippage={setSlippage} />
      )}
      {!assetsLoaded ? (
        <CustomLoader text="Loading Assets..." size={25} />
      ) : (
        <motion.div
          className="flex flex-col gap-4 relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          layout
        >
          <div className="flex flex-col gap-4 relative">
            <SectionSwap
              type="from"
              value={fromAmount?.value}
              handleChange={handleFromValueChange}
            />
            <FiRepeat
              className="transform rotate-90 p-1 bg-alternative absolute left-6 position-swap-icon cursor-pointer hover:bg-alternativeDark z-20 border-4 border-white box-border"
              size="30"
              onClick={switchToAndFrom}
            />
          </div>
          <SectionSwap
            type="to"
            value={toAmount?.value}
            handleChange={handleToValueChange}
          />
        </motion.div>
      )}
      {exchangeRate && (
        <ExtraInformation
          fromBrand={fromBrand}
          toBrand={toBrand}
          exchangeRate={exchangeRate}
          receiveAtLeast={receiveAtLeast}
        />
      )}
      <motion.button
        className={clsx(
          'flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-xl  font-medium p-3  uppercase',
          assetsLoaded && (!errors.size || swapped)
            ? 'bg-primary hover:bg-primaryDark text-white'
            : 'text-gray-500',
        )}
        onClick={() => {
          if (swapped) {
            addError(Errors.IN_PROGRESS);
          } else if (!(fromBrand && toBrand)) {
            addError(Errors.NO_BRANDS);
          } else if (!(fromPurse && toPurse)) {
            addError(Errors.NO_PURSES);
          } else if (
            !(
              fromAmount &&
              toAmount &&
              fromAmount.value > 0n &&
              toAmount.value > 0n
            )
          ) {
            addError(Errors.EMPTY_AMOUNTS);
          } else {
            handleSwap();
          }
        }}
      >
        <motion.div className="relative flex-row w-full justify-center items-center">
          {swapped && swapButtonStatus === 'Swap' && (
            <Loader
              className="absolute right-0"
              type="Oval"
              color="#fff"
              height={28}
              width={28}
            />
          )}
          {swapped && swapButtonStatus === 'Swapped' && (
            <FiCheck className="absolute right-0" size={28} />
          )}
          {swapped &&
            (swapButtonStatus === 'rejected' ||
              swapButtonStatus === 'declined') && (
              <BiErrorCircle className="absolute right-0" size={28} />
            )}
          <div className="text-white">{swapButtonStatus}</div>
        </motion.div>
      </motion.button>
      {errorsToRender}
    </motion.div>
  );
};

export default Swap;
