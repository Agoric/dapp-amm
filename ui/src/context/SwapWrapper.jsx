import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { makeRatio } from '@agoric/zoe/src/contractSupport';
import { AmountMath } from '@agoric/ertp';
import { multiplyRatios } from '@agoric/zoe/src/contractSupport/ratio';
import { makeEstimator } from '@agoric/run-protocol/src/vpool-xyk-amm/estimate';
import SwapContext, { Errors, defaultToastProperties } from './SwapContext';
import { useApplicationContext } from './Application';

const PoolWrapper = ({ children }) => {
  const {
    state: {
      purses,
      walletOffers,
      poolStates,
      central: centralBrand,
      poolFee,
      protocolFee,
    },
  } = useApplicationContext();

  const [fromBrand, setFromBrand] = useState(null);
  const [toBrand, setToBrand] = useState(null);
  const [fromPurseId, setFromPurseId] = useState(null);
  const [toPurseId, setToPurseId] = useState(null);
  // Keep track of the last input changed by the user, can be 'secondary' or
  // 'central'. This is used to decide which input to auto-update on price
  // changes.
  const [lastUserInput, setLastUserInput] = useState(null);
  const [optionsEnabled, setOptionsEnabled] = useState(false);
  const [fromAmount, setFromAmount] = useState(null);
  const [toAmount, setToAmount] = useState(null);
  const [slippage, setSlippage] = useState(0.5);
  const [swapped, setSwapped] = useState(false);
  const [toastId, setToastId] = useState('swap');
  const [currentOfferId, setCurrentOfferId] = useState(null);
  const [swapButtonStatus, setSwapButtonStatus] = useState('Swap');

  const fromPurse =
    fromPurseId &&
    purses &&
    purses.find(({ pursePetname }) => pursePetname === fromPurseId);

  const toPurse =
    toPurseId &&
    purses &&
    purses.find(({ pursePetname }) => pursePetname === toPurseId);

  const [errors, setErrors] = useState(() => new Set());
  const addError = error => {
    setErrors(prev => new Set(prev).add(error));
  };
  const removeError = error => {
    setErrors(prev => {
      const next = new Set(prev);
      next.delete(error);
      return next;
    });
  };

  useEffect(() => {
    removeError(Errors.EMPTY_AMOUNTS);
  }, [fromAmount, toAmount]);

  useEffect(() => {
    if (slippage < 0.1 || slippage > 5) {
      addError(Errors.SLIPPAGE);
    } else {
      removeError(Errors.SLIPPAGE);
    }
  }, [slippage]);

  useEffect(() => {
    if (fromPurse && toPurse) {
      removeError(Errors.NO_PURSES);
    }
  }, [fromPurse, toPurse]);

  useEffect(() => {
    if (fromBrand && toBrand) {
      removeError(Errors.NO_BRANDS);
    }
    if (!fromBrand) {
      setFromAmount(null);
    }
    if (!toBrand) {
      setToAmount(null);
    }
    if (toPurse?.brand !== toBrand) {
      setToPurseId(null);
    }
    if (fromPurse?.brand !== fromBrand) {
      setFromPurseId(null);
    }
  }, [fromBrand, toBrand]);

  useEffect(() => {
    if (!swapped) {
      removeError(Errors.IN_PROGRESS);
    }
  }, [swapped]);

  useEffect(() => {
    if (swapped) {
      const currentOffer = walletOffers.find(
        ({ id, rawId }) => rawId === currentOfferId || id === currentOfferId,
      );
      console.log('CURRENT OFFER', currentOfferId, currentOffer);
      const swapStatus = currentOffer?.status;
      if (swapStatus === 'accept') {
        setSwapButtonStatus('Swapped');
        toast.update(toastId, {
          render: 'Assets successfully swapped',
          type: toast.TYPE.SUCCESS,
          ...defaultToastProperties,
        });
      } else if (swapStatus === 'decline') {
        setSwapButtonStatus('declined');
        setToastId(
          toast.update(toastId, {
            render: 'Swap declined by User',
            type: toast.TYPE.ERROR,
            ...defaultToastProperties,
          }),
        );
      } else if (currentOffer?.error) {
        setSwapButtonStatus('rejected');
        setToastId(
          toast.update(toastId, {
            render: 'Swap offer rejected by Wallet',
            type: toast.TYPE.WARNING,
            ...defaultToastProperties,
          }),
        );
      }
      if (
        swapStatus === 'accept' ||
        swapStatus === 'decline' ||
        currentOffer?.error
      ) {
        setCurrentOfferId(null);
        setTimeout(() => {
          setSwapped(false);
          setSwapButtonStatus('Swap');
        }, 3000);
      }
    }
  }, [walletOffers]);

  const calcExchangeRate = () => {
    if (!fromBrand || !toBrand) return null;

    const fromPool = poolStates.get(fromBrand);
    const toPool = poolStates.get(toBrand);
    const fromBrandExchangeRate =
      fromBrand === centralBrand
        ? makeRatio(1n, centralBrand, 1n, centralBrand)
        : makeRatio(
            fromPool.centralAmount.value || 1n,
            fromPool.centralAmount.brand,
            fromPool.secondaryAmount.value || 1n,
            fromPool.secondaryAmount.brand,
          );
    const toBrandExchangeRate =
      toBrand === centralBrand
        ? makeRatio(1n, centralBrand, 1n, centralBrand)
        : makeRatio(
            toPool.secondaryAmount.value || 1n,
            toPool.secondaryAmount.brand,
            toPool.centralAmount.value || 1n,
            toPool.centralAmount.brand,
          );
    return multiplyRatios(fromBrandExchangeRate, toBrandExchangeRate);
  };
  const exchangeRate = calcExchangeRate();

  const autofillToAmount = newFromAmount => {
    // Auto-fill central value input based on exchange rate.
    if (!(newFromAmount && exchangeRate)) {
      setToAmount(null);
      return;
    }
    console.log('poolFee', poolFee, 'protocolFee', protocolFee);
    const estimator = makeEstimator(centralBrand, {
      poolFeeBP: poolFee,
      protocolFeeBP: protocolFee,
      slippageBP: 0n,
    });
    const newToAmount = estimator.estimateProceeds(
      newFromAmount,
      toBrand,
      poolStates,
    );
    setToAmount(newToAmount);
  };

  const autofillFromAmount = newToAmount => {
    // Auto-fill secondary value input based on exchange rate.
    if (!(newToAmount && exchangeRate)) {
      setFromAmount(null);
      return;
    }
    console.log('poolFee', poolFee, 'protocolFee', protocolFee);
    const estimator = makeEstimator(centralBrand, {
      poolFeeBP: poolFee,
      protocolFeeBP: protocolFee,
      slippageBP: 0n,
    });
    const newFromAmount = estimator.estimateRequired(
      fromBrand,
      newToAmount,
      poolStates,
    );
    setFromAmount(newFromAmount);
  };

  const handleFromValueChange = value => {
    const amount = AmountMath.make(fromBrand, value);
    setFromAmount(amount);
    setLastUserInput('from');
    autofillToAmount(amount);
  };

  const handleToValueChange = value => {
    const amount = AmountMath.make(toBrand, value);
    setToAmount(amount);
    setLastUserInput('to');
    autofillFromAmount(amount);
  };

  useEffect(() => {
    if (lastUserInput === 'to') {
      autofillFromAmount(toAmount);
    }
    if (lastUserInput === 'from') {
      autofillToAmount(fromAmount);
    }
  }, [poolStates, fromBrand, toBrand]);

  const swapContext = {
    fromBrand,
    setFromBrand,
    toBrand,
    setToBrand,
    fromPurse,
    setFromPurseId,
    toPurse,
    setToPurseId,
    errors,
    addError,
    removeError,
    fromAmount,
    toAmount,
    slippage,
    setToastId,
    setCurrentOfferId,
    setSwapped,
    setToAmount,
    setFromAmount,
    setLastUserInput,
    lastUserInput,
    setOptionsEnabled,
    optionsEnabled,
    swapped,
    setSlippage,
    swapButtonStatus,
    handleToValueChange,
    handleFromValueChange,
    exchangeRate,
  };

  return (
    <SwapContext.Provider value={swapContext}>{children}</SwapContext.Provider>
  );
};

export default PoolWrapper;
