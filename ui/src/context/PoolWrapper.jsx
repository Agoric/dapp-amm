import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  floorMultiplyBy,
  invertRatio,
  makeRatio,
} from '@agoric/zoe/src/contractSupport';
import { AmountMath } from '@agoric/ertp';
import { useApplicationContext } from './Application';
import RemovePoolWrapper from './RemovePoolWrapper';
import PoolContext, { defaultToastProperties, Errors } from './PoolContext';

const PoolWrapper = ({ children }) => {
  const {
    state: { purses, central: centralBrand, poolStates, walletOffers },
  } = useApplicationContext();

  const [brandToAdd, setBrandToAdd] = useState(null);
  const [purseIdToAdd, setPurseIdToAdd] = useState(null);
  const [centralPurseIdToUse, setCentralPurseIdToUse] = useState(null);
  const [centralAmount, setCentralAmount] = useState(null);
  const [secondaryAmount, setSecondaryAmount] = useState(null);
  const [showAddLoader, setShowAddLoader] = useState(false);
  const [addButtonStatus, setAddButtonStatus] = useState('Add Liquidity');
  const [addToastId, setAddToastId] = useState('liquidityf');
  const [addErrors, setAddErrors] = useState(() => new Set());
  // Keep track of the last input changed by the user, can be 'secondary' or
  // 'central'. This is used to decide which input to auto-update on price
  // changes.
  const [lastUserInput, setLastUserInput] = useState(null);
  const [addOfferId, setAddOfferId] = useState(walletOffers.length);

  const pool = poolStates.get(brandToAdd);
  const exchangeRate =
    pool &&
    makeRatio(
      pool.centralAmount.value || 1n,
      pool.centralAmount.brand,
      pool.secondaryAmount.value || 1n,
      pool.secondaryAmount.brand,
    );

  const addAddError = error => {
    setAddErrors(prev => new Set(prev).add(error));
  };

  const removeAddError = error => {
    setAddErrors(prev => {
      const next = new Set(prev);
      next.delete(error);
      return next;
    });
  };

  const autofillCentralFromSecondary = amount => {
    // Auto-fill central value input based on exchange rate.
    if (amount === null) {
      setCentralAmount(null);
      return;
    }
    const newCentralAmount = floorMultiplyBy(amount, exchangeRate);
    setCentralAmount(newCentralAmount);
  };

  const autofillSecondaryFromCentral = amount => {
    // Auto-fill secondary value input based on exchange rate.
    if (amount === null) {
      setSecondaryAmount(null);
      return;
    }
    const newSecondaryAmount = floorMultiplyBy(
      amount,
      invertRatio(exchangeRate),
    );
    setSecondaryAmount(newSecondaryAmount);
  };

  const handleSecondaryValueChange = value => {
    const amount = AmountMath.make(brandToAdd, value);
    setSecondaryAmount(amount);
    setLastUserInput('secondary');
    autofillCentralFromSecondary(amount);
  };

  const handleCentralValueChange = value => {
    const amount = AmountMath.make(centralBrand, value);
    setCentralAmount(amount);
    setLastUserInput('central');
    autofillSecondaryFromCentral(amount);
  };

  useEffect(() => {
    if (lastUserInput === 'secondary') {
      autofillCentralFromSecondary(secondaryAmount);
    }
    if (lastUserInput === 'central') {
      autofillSecondaryFromCentral(centralAmount);
    }
  }, [poolStates]);

  useEffect(() => {
    setCentralAmount(null);
    setSecondaryAmount(null);
    setLastUserInput(null);
  }, [brandToAdd]);

  useEffect(() => {
    if (!showAddLoader) {
      removeAddError(Errors.IN_PROGRESS);
    }
  }, [showAddLoader]);

  useEffect(() => {
    removeAddError(Errors.NO_BRANDS);
  }, [brandToAdd]);

  useEffect(() => {
    removeAddError(Errors.NO_AMOUNTS);
  }, [secondaryAmount, centralAmount]);

  useEffect(() => {
    if (showAddLoader) {
      const addOffer = walletOffers.find(
        ({ id, rawId }) => rawId === addOfferId || id === addOfferId,
      );
      const liquidityStatus = addOffer?.status;
      if (liquidityStatus === 'accept') {
        setAddButtonStatus('added');
        toast.update(addToastId, {
          render: 'Liquidity added successfully',
          type: toast.TYPE.SUCCESS,
          ...defaultToastProperties,
        });
      } else if (liquidityStatus === 'decline') {
        setAddButtonStatus('declined');
        setAddToastId(
          toast.update(addToastId, {
            render: 'Offer declined by User',
            type: toast.TYPE.ERROR,
            ...defaultToastProperties,
          }),
        );
      } else if (addOffer?.error) {
        setAddButtonStatus('rejected');
        setAddToastId(
          toast.update(addToastId, {
            render: 'Offer rejected by Wallet',
            type: toast.TYPE.WARNING,
            ...defaultToastProperties,
          }),
        );
      }
      if (
        liquidityStatus === 'accept' ||
        liquidityStatus === 'decline' ||
        addOffer?.error
      ) {
        setAddOfferId(null);
        setTimeout(() => {
          setShowAddLoader(false);
          setAddButtonStatus('Add Liquidity');
        }, 3000);
      }
    }
  }, [walletOffers]);

  const purseToAdd =
    purseIdToAdd &&
    purses &&
    purses.find(({ pursePetname }) => pursePetname === purseIdToAdd);

  const centralPurseToUse =
    centralPurseIdToUse &&
    purses &&
    purses.find(({ pursePetname }) => pursePetname === centralPurseIdToUse);

  useEffect(() => {
    setPurseIdToAdd(null);
  }, [brandToAdd]);

  useEffect(() => {
    removeAddError(Errors.NO_PURSES);
  }, [purseIdToAdd, centralPurseIdToUse]);

  const poolContext = {
    brandToAdd,
    setBrandToAdd,
    purseToAdd,
    setPurseIdToAdd,
    centralPurseToUse,
    setCentralPurseIdToUse,
    showAddLoader,
    setAddButtonStatus,
    addButtonStatus,
    setAddToastId,
    addToastId,
    setShowAddLoader,
    setAddOfferId,
    centralAmount,
    secondaryAmount,
    handleCentralValueChange,
    handleSecondaryValueChange,
    addAddError,
    addErrors,
    exchangeRate,
  };

  return (
    <PoolContext.Provider value={poolContext}>
      <RemovePoolWrapper>{children}</RemovePoolWrapper>
    </PoolContext.Provider>
  );
};

export default PoolWrapper;
