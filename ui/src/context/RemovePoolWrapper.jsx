import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useApplicationContext } from './Application';
import RemovePoolContext from './RemovePoolContext';
import { defaultToastProperties, Errors } from './PoolContext';

const RemovePoolWrapper = ({ children }) => {
  const {
    state: { purses, walletOffers },
  } = useApplicationContext();

  const [brandToRemove, setBrandToRemove] = useState(null);
  const [purseIdToRemove, setPurseIdToRemove] = useState(null);
  const [removed, setRemoved] = useState(false);
  const [amountToRemove, setAmountToRemove] = useState(null);
  const [removeErrors, setRemoveErrors] = useState(() => new Set());
  const [removeOfferId, setRemoveOfferId] = useState(walletOffers.length);
  const [removeToastId, setRemoveToastId] = useState('remove-liquidity');
  const [removeButtonStatus, setRemoveButtonStatus] =
    useState('Confirm Withdrawal');

  const addRemoveError = error => {
    setRemoveErrors(prev => new Set(prev).add(error));
  };

  const removeRemoveError = error => {
    setRemoveErrors(prev => {
      const next = new Set(prev);
      next.delete(error);
      return next;
    });
  };

  useEffect(() => {
    if (removed) {
      const removeStatus = walletOffers[removeOfferId]?.status;
      if (removeStatus === 'accept') {
        setRemoveButtonStatus('removed');
        toast.update(removeToastId, {
          render: 'Liquidity successfully removed',
          type: toast.TYPE.SUCCESS,
          ...defaultToastProperties,
        });
      } else if (removeStatus === 'decline') {
        setRemoveButtonStatus('declined');
        setRemoveToastId(
          toast.update(removeToastId, {
            render: 'Remove liquidity offer declined by User',
            type: toast.TYPE.ERROR,
            ...defaultToastProperties,
          }),
        );
      } else if (walletOffers[removeOfferId]?.error) {
        setRemoveButtonStatus('rejected');
        setRemoveToastId(
          toast.update(removeToastId, {
            render: 'Remove liquidity offer rejected by Wallet',
            type: toast.TYPE.WARNING,
            ...defaultToastProperties,
          }),
        );
      }
      if (
        removeStatus === 'accept' ||
        removeStatus === 'decline' ||
        walletOffers[removeOfferId]?.error
      ) {
        setTimeout(() => {
          setRemoved(false);
          setRemoveButtonStatus('Confirm Withdrawal');
        }, 3000);
      }
    }
  }, [walletOffers[removeOfferId]]);

  const purseToRemove =
    purseIdToRemove &&
    purses &&
    purses.find(({ pursePetname }) => pursePetname === purseIdToRemove);

  useEffect(() => {
    setPurseIdToRemove(null);
    removeRemoveError(Errors.NO_BRANDS);
  }, [brandToRemove]);

  useEffect(() => {
    removeRemoveError(Errors.IN_PROGRESS);
  }, [removed]);

  useEffect(() => {
    removeRemoveError(Errors.NO_PURSES);
  }, [purseIdToRemove]);

  useEffect(() => {
    removeRemoveError(Errors.NO_AMOUNTS);
  }, [amountToRemove]);

  const removePoolContext = {
    brandToRemove,
    setBrandToRemove,
    purseToRemove,
    setPurseIdToRemove,
    removed,
    setRemoved,
    amountToRemove,
    setAmountToRemove,
    removeErrors,
    setRemoveErrors,
    removeOfferId,
    setRemoveOfferId,
    removeButtonStatus,
    setRemoveButtonStatus,
    addRemoveError,
    setRemoveToastId,
  };

  return (
    <RemovePoolContext.Provider value={removePoolContext}>
      {children}
    </RemovePoolContext.Provider>
  );
};

export default RemovePoolWrapper;
