import React, { useContext, useEffect, useState } from 'react';
import clsx from 'clsx';
import Loader from 'react-loader-spinner';
import AssetContext from 'context/AssetContext';
import PoolContext from 'context/PoolContext';
import { useApplicationContext } from 'context/Application';
import { FiCheck } from 'react-icons/fi';
import { BiErrorCircle } from 'react-icons/bi';
import { motion } from 'framer-motion';
import { FiArrowDown } from 'react-icons/fi';

import { removeLiquidityService } from 'services/liquidity.service';

import AmountToRemove from './AmountToRemove';
import PoolSelector from './PoolSelector/PoolSelector';
import PursesRemovePool from './PursesRemovePool/PursesRemovePool';

const RemoveLiquidity = props => {
  const [pool] = useContext(PoolContext);
  const [error, setError] = useState(false);
  const [asset, setAsset] = useContext(AssetContext);
  const [amount, setAmount] = useState('');
  const [validated, setValidated] = useState(false);
  const [removed, setRemoved] = useState(false);

  // get state
  const { state, walletP } = useApplicationContext();
  const [ Id, setId ] = useState('swap');

  const {
    autoswap: { ammAPI },
    purses,
    walletOffers
  } = state;
    const [currentOfferId, setCurrentOfferId] = useState(walletOffers.length);
    const [wallet, setWallet] = useState(false);
    const [removeButtonStatus, setRemoveButtonStatus] = useState('Confirm Withdrawl');
    const defaultProperties = {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      containerId: 'Info',
    };
  useEffect(() => {
    if (removed && wallet) {
      let removeStatus = walletOffers[currentOfferId]?.status;
      if (removeStatus === 'accept') {
        setRemoveButtonStatus('removed');
        toast.update(Id, { render: 'Assets successfully swapped', type: toast.TYPE.SUCCESS, ...defaultProperties });
      } else if (removeStatus === 'decline') {
        setRemoveButtonStatus('declined');
        setId(toast.update(Id, {render:'Swap declined by User',type:toast.TYPE.ERROR,...defaultProperties}));
      } else if (walletOffers[currentOfferId]?.error) {
        setRemoveButtonStatus('rejected');
        setId(toast.update(Id, {render:'Swap offer rejected by Wallet',type:toast.TYPE.WARNING,...defaultProperties}));
      }
      if (
        swapStatus === 'accept' ||
        swapStatus === 'decline' ||
        walletOffers[currentOfferId]?.error
      ) {
        setTimeout(() => {
          setSwapped(false);
          setSwapButtonStatus('Confirm Withdrawl');
        }, 3000);
      }
    }
  }, [walletOffers[currentOfferId]]);

  const handleRemovePool = () => {
    if (!asset.centralRemove && !asset.secondaryRemove) {
      setError('Please select purses first');
      return;
    } else if (!amount) {
      setError('Please enter the amount first');
      return;
    }
    setRemoved(true);
    const removeLiquidityResp =
      asset.centralRemove &&
      asset.secondaryRemove &&
      removeLiquidityService(
        asset.centralRemove,
        asset.secondaryRemove,
        amount,
        purses,
        ammAPI,
        walletP,
      );

    if (removeLiquidityResp.status === 200) {
      console.log(removeLiquidityResp.message);
    } else {
      console.error(removeLiquidityResp);
    }
    setWallet(true);
    // reset values
    setAsset({ centralRemove: undefined, secondaryRemove: undefined });
    setAmount('');
  };

  useEffect(() => {
    setAmount('');
    setAsset({ central: null, liquidity: null });
  }, [pool?.selectRemove]);

  useEffect(() => {
    (amount || (asset?.centralRemove && asset?.secondaryRemove)) &&
      setError(null);

    setValidated(false);
    amount &&
      asset?.centralRemove?.purse &&
      asset?.secondaryRemove?.purse &&
      setValidated(true);
  }, [amount, asset]);

  return (
    <motion.div
      className="flex flex-col gap-4"
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <PoolSelector {...props} />
      <div className="flex flex-col  gap-4 relative">
        <AmountToRemove
          value={amount}
          setValue={setAmount}
          poolShare={asset?.secondaryRemove?.liquidityInfo?.User?.share}
        />
        <FiArrowDown
          // className={
          //   'p-2 bg-alternative text-3xl absolute left-6 ring-4 ring-white position-swap-icon-remove'
          // }
          size={30}
          className={
            'p-1 bg-alternative text-3xl absolute left-6 position-swap-icon-remove border-4 border-white'
          }
          style={{ top: asset.secondaryRemove ? '48.5%' : '' }}
        />
        <PursesRemovePool amount={amount} />
      </div>
      <button
        className={clsx(
          'bg-gray-100 hover:bg-gray-200 text-xl  font-medium p-3  uppercase',
          validated
            ? 'bg-primary hover:bg-primaryDark text-white'
            : 'text-gray-500',
        )}
        onClick={handleRemovePool}
      >
      {removed && removeButtonStatus === 'Confirm Withdrawl' && (
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
      {removed && removeButtonStatus === 'declined' ||removeButtonStatus === 'rejected' && (
        <BiErrorCircle className="absolute right-0" size={28} />
      )}
      <div className="text-white">{removeButtonStatus}</div>      </button>
      {error && <h3 className="text-red-600">{error}</h3>}
    </motion.div>
  );
};

export default RemoveLiquidity;
