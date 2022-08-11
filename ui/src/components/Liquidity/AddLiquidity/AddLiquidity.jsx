import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Loader from 'react-loader-spinner';
import { FiCheck } from 'react-icons/fi';
import React, { useContext } from 'react';
import clsx from 'clsx';
import { BiErrorCircle } from 'react-icons/bi';

import {
  addLiquidityService,
  createNewPurse,
} from 'services/liquidity.service';
import PoolContext, {
  Errors,
  defaultToastProperties,
} from 'context/PoolContext';
import { useApplicationContext } from 'context/Application';
import { makeDisplayFunctions } from 'utils/helpers';
import CentralAssetLiquidity from './SectionLiquidity/CentralAssetLiquidity';
import SecondaryAssetLiquidity from './SectionLiquidity/SecondaryAssetLiquidity';
import RateLiquidity from '../RateLiquidity/RateLiquidity';

const AddLiquidity = ({ setOpen }) => {
  const {
    brandToAdd,
    purseToAdd,
    centralPurseToUse,
    setShowAddLoader,
    showAddLoader,
    addButtonStatus,
    setAddOfferId,
    centralAmount,
    secondaryAmount,
    handleCentralValueChange,
    handleSecondaryValueChange,
    addAddError,
    addErrors,
    exchangeRate,
    setAddToastId,
  } = useContext(PoolContext);

  const { state, walletP } = useApplicationContext();
  const { purses, poolStates, brandToInfo } = state;
  const pool = poolStates.get(brandToAdd);
  const liquidityTokenPurse =
    pool && purses.find(({ brand }) => brand === pool.liquidityTokens.brand);

  const { displayBrandPetname } = makeDisplayFunctions(brandToInfo);

  const handleAddLiquidity = async () => {
    setShowAddLoader(true);
    try {
      const offerId = await addLiquidityService(
        centralAmount,
        centralPurseToUse,
        secondaryAmount,
        purseToAdd,
        liquidityTokenPurse,
        walletP,
        pool,
      );
      setAddOfferId(offerId);
    } catch (e) {
      console.error('Failed to add liquidity offer', e);
      setShowAddLoader(false);
      return;
    }
    setAddToastId(
      toast('Please approve the offer in your wallet.', {
        ...defaultToastProperties,
        type: toast.TYPE.INFO,
        progress: undefined,
        hideProgressBar: true,
        autoClose: false,
      }),
    );
  };

  const errorsToRender = [];
  addErrors.forEach(e => {
    errorsToRender.push(
      <motion.h3 key={e} layout className="text-red-600">
        {e}
      </motion.h3>,
    );
  });

  const onAddIssuerClicked = e => {
    e.preventDefault();
    createNewPurse(walletP, displayBrandPetname(brandToAdd), 'board03125');
  };

  const purseMissingMessage = pool && !liquidityTokenPurse && (
    <motion.h3 layout className="text-red-600">
      No liquidity token purse found in wallet.{' '}
      <a
        href="#"
        onClick={onAddIssuerClicked}
        className="hover:underline text-blue-400"
      >
        Add Issuer
      </a>
    </motion.h3>
  );

  return (
    <motion.div
      className="flex flex-col gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col gap-4 relative overflow-hidden">
        <CentralAssetLiquidity
          value={centralAmount?.value}
          handleChange={handleCentralValueChange}
        />
        <SecondaryAssetLiquidity
          value={secondaryAmount?.value}
          handleChange={handleSecondaryValueChange}
          setPoolMenuOpen={setOpen}
        />
      </div>
      {exchangeRate && <RateLiquidity secondaryBrand={brandToAdd} />}
      <button
        className={clsx(
          'bg-gray-100 hover:bg-gray-200 text-xl font-medium p-3 uppercase flex justify-center',
          (!addErrors.size && (!pool || liquidityTokenPurse)) || showAddLoader
            ? 'bg-primary hover:bg-primaryDark text-white'
            : 'text-gray-500',
        )}
        onClick={() => {
          if (showAddLoader) {
            addAddError(Errors.IN_PROGRESS);
          } else if (!brandToAdd) {
            addAddError(Errors.NO_BRANDS);
          } else if (!centralPurseToUse || !purseToAdd) {
            addAddError(Errors.NO_PURSES);
          } else if (
            !(
              secondaryAmount &&
              centralAmount &&
              centralAmount.value > 0n &&
              secondaryAmount.value > 0n
            )
          ) {
            addAddError(Errors.NO_AMOUNTS);
          } else {
            handleAddLiquidity();
          }
        }}
      >
        <motion.div className="relative flex-row w-full justify-center items-center">
          {showAddLoader && addButtonStatus === 'Add Liquidity' && (
            <Loader
              className="absolute right-0"
              type="Oval"
              color="#fff"
              height={28}
              width={28}
            />
          )}
          {showAddLoader && addButtonStatus === 'added' && (
            <FiCheck className="absolute right-0" size={28} />
          )}
          {(showAddLoader && addButtonStatus === 'rejected') ||
            (addButtonStatus === 'declined' && (
              <BiErrorCircle className="absolute right-0" size={28} />
            ))}
          <div className="text-white">{addButtonStatus}</div>
        </motion.div>
      </button>
      {purseMissingMessage}
      {errorsToRender}
    </motion.div>
  );
};

export default AddLiquidity;
