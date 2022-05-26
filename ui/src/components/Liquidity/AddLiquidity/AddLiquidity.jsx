import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Loader from 'react-loader-spinner';
import { FiCheck, FiPlus } from 'react-icons/fi';
import React, { useContext } from 'react';
import clsx from 'clsx';
import { BiErrorCircle } from 'react-icons/bi';

import { addLiquidityService } from 'services/liquidity.service';
import PoolContext, {
  Errors,
  defaultToastProperties,
} from 'context/PoolContext';
import { useApplicationContext } from 'context/Application';
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
  const { walletOffers, autoswap, purses, poolStates } = state;
  const { ammAPI } = autoswap ?? {};
  const pool = poolStates.get(brandToAdd);

  const handleAddLiquidity = () => {
    setAddToastId(
      toast('Please approve the offer in your wallet.', {
        ...defaultToastProperties,
        type: toast.TYPE.INFO,
        progress: undefined,
        hideProgressBar: true,
        autoClose: false,
      }),
    );
    setAddOfferId(walletOffers.length);
    setShowAddLoader(true);
    addLiquidityService(
      centralAmount,
      centralPurseToUse,
      secondaryAmount,
      purseToAdd,
      ammAPI,
      walletP,
      purses,
      pool,
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
        <FiPlus
          size="30"
          className="transform-gpu rotate-90 p-1 bg-alternative text-3xl absolute left-6 position-swap-icon-liquidity border-4 border-white"
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
          'bg-gray-100 hover:bg-gray-200 text-xl  font-medium p-3  uppercase flex justify-center',
          !addErrors.size || showAddLoader
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
          } else if (!(secondaryAmount && centralAmount)) {
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
      {errorsToRender}
    </motion.div>
  );
};

export default AddLiquidity;
