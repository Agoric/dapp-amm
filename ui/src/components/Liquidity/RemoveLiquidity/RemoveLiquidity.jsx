import React, { useContext } from 'react';
import clsx from 'clsx';
import Loader from 'react-loader-spinner';
import { toast } from 'react-toastify';
import { useApplicationContext } from 'context/Application';
import { FiCheck, FiArrowDown } from 'react-icons/fi';
import { BiErrorCircle } from 'react-icons/bi';
import { motion } from 'framer-motion';

import { removeLiquidityService } from 'services/liquidity.service';
import PoolContext, {
  defaultToastProperties,
  Errors,
} from 'context/PoolContext';
import { makeDisplayFunctions } from 'utils/helpers';
import { makeRatio } from '@agoric/zoe/src/contractSupport';
import RemovePoolContext from 'context/RemovePoolContext';
import AmountToRemove from './AmountToRemove';
import PoolSelector from './PoolSelector/PoolSelector';
import PursesRemovePool from './PursesRemovePool/PursesRemovePool';

const RemoveLiquidity = ({ setOpen }) => {
  const { centralPurseToUse } = useContext(PoolContext);
  const {
    purseToRemove,
    brandToRemove,
    removed,
    addRemoveError,
    setRemoved,
    amountToRemove,
    setRemoveToastId,
    setRemoveOfferId,
    setAmountToRemove,
    removeButtonStatus,
    removeErrors,
  } = useContext(RemovePoolContext);
  const { state, walletP } = useApplicationContext();

  const { purses, poolStates, brandToInfo } = state;
  const poolState = poolStates.get(brandToRemove);

  const handleRemovePool = async () => {
    if (removed) {
      addRemoveError(Errors.IN_PROGRESS);
      return;
    } else if (!brandToRemove) {
      addRemoveError(Errors.NO_BRANDS);
      return;
    } else if (!(centralPurseToUse && purseToRemove)) {
      addRemoveError(Errors.NO_PURSES);
      return;
    } else if (!amountToRemove) {
      addRemoveError(Errors.NO_AMOUNTS);
      return;
    }
    setRemoved(true);
    try {
      const id = await removeLiquidityService(
        centralPurseToUse,
        purseToRemove,
        amountToRemove,
        purses,
        walletP,
        poolState,
      );
      setRemoveOfferId(id);
    } catch (e) {
      console.error('Failed to add liquidity offer', e);
      setRemoved(false);
      return;
    }
    setRemoveToastId(
      toast('Please approve the offer in your wallet.', {
        ...defaultToastProperties,
        type: toast.TYPE.INFO,
        progress: undefined,
        hideProgressBar: true,
        autoClose: false,
      }),
    );
  };

  const { displayPercent } = makeDisplayFunctions(brandToInfo);

  const liquidityBrand = poolStates?.get(brandToRemove)?.liquidityTokens?.brand;

  const totalUserLiquidityForBrand =
    liquidityBrand &&
    (purses ?? [])
      .filter(({ brand: purseBrand }) => purseBrand === liquidityBrand)
      .map(({ value }) => value)
      .reduce((prev, cur) => prev + cur, 0n);
  const totalPoolTokens =
    totalUserLiquidityForBrand &&
    poolState &&
    (poolState.liquidityTokens.value < totalUserLiquidityForBrand
      ? totalUserLiquidityForBrand
      : poolState.liquidityTokens.value);
  const userPoolSharePercent =
    (liquidityBrand &&
      totalUserLiquidityForBrand &&
      totalPoolTokens &&
      displayPercent(
        makeRatio(
          totalUserLiquidityForBrand,
          liquidityBrand,
          totalPoolTokens,
          liquidityBrand,
        ),
        7,
      )) ||
    '0.0000000';

  const errorsToRender = [];
  removeErrors.forEach(e => {
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
      <PoolSelector setOpen={setOpen} />
      <div className="flex flex-col  gap-4 relative">
        <AmountToRemove
          value={amountToRemove}
          setValue={setAmountToRemove}
          poolShare={userPoolSharePercent}
        />
        <FiArrowDown
          size={30}
          className={
            'p-1 bg-alternative text-3xl absolute left-6 position-swap-icon-remove border-4 border-white'
          }
          style={{ top: '48.5%' }}
        />
        <PursesRemovePool amount={amountToRemove} />
      </div>
      <button
        className={clsx(
          'bg-gray-100 hover:bg-gray-200 text-xl  font-medium p-3  uppercase',
          !removeErrors.size || removed
            ? 'bg-primary hover:bg-primaryDark text-white'
            : 'text-gray-500',
        )}
        onClick={handleRemovePool}
      >
        <motion.div className="relative flex-row w-full justify-center items-center">
          {removed && removeButtonStatus === 'Confirm Withdrawal' && (
            <Loader
              className="absolute right-0"
              type="Oval"
              color="#fff"
              height={28}
              width={28}
            />
          )}
          {removed && removeButtonStatus === 'removed' && (
            <FiCheck className="absolute right-0" size={28} />
          )}
          {(removed && removeButtonStatus === 'declined') ||
            (removeButtonStatus === 'rejected' && (
              <BiErrorCircle className="absolute right-0" size={28} />
            ))}
          <div className="text-white">{removeButtonStatus}</div>
        </motion.div>
      </button>
      {errorsToRender}
    </motion.div>
  );
};

export default RemoveLiquidity;
