import React, { useState, useEffect } from 'react';
import { setToast } from 'utils/helpers';
import { useApplicationContext } from 'context/Application';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'styles/globals.css';
import agoricLogo from 'assets/agoric-logo.svg';
import Swap from 'components/Swap/Swap';
import AssetWrapper from 'context/AssetWrapper';
import { Tab } from '@headlessui/react';
import clsx from 'clsx';
import Liquidity from 'components/Liquidity/Liquidity';
import PoolWrapper from 'context/PoolWrapper';
import { motion } from 'framer-motion';
import ConnectionToast from 'components/Wallet/ConnectionToast';
import ApprovalToast from 'components/Wallet/ApprovalToast';
import WalletToast from 'components/Wallet/WalletToast';
import InformationToast from 'components/components/InformationToast';

const App = () => {
  const [index, setIndex] = useState(0);
  const { state } = useApplicationContext();
  useEffect(() => {
    if (state?.error?.name) {
      setToast(state.error.name, 'warning', {
        position: 'top-right',
        autoClose: false,
        containerId: 'Info',
      });
    }
   
  }, [state?.error]);
  const swapHook = useState({ from: null, to: null });

  return (
    <PoolWrapper>
      <InformationToast />
      <WalletToast />
    
      <motion.div
        className=" min-h-screen container px-4 mx-auto  py-6 flex flex-col  items-center relative"
        layout
      >
        <div className='ml-[15%]'>
          <img
        src={agoricLogo}
        alt="Agoric Logo"
        className="relative pl-10 lg:absolute top-0 left-0  py-6  px-6 "
      /></div>
       
        <Tab.Group
          defaultIndex={0}
          onChange={i => {
            setIndex(i);
            console.log(i);
          }}
        >
          <Tab.List className="bg-white p-2 text-md shadow-red-light-sm rounded-sm mb-20 transition-all duration-300 ease-in-out">
            <Tab>
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={clsx(
                  'tab font-medium',
                  index === 0 ? 'bg-alternative ' : 'bg-white',
                )}
              >
                Swap
              </motion.div>
            </Tab>
            <Tab>
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={clsx(
                  'tab font-medium',
                  index === 1 ? 'bg-alternative ' : 'bg-white',
                )}
              >
                Liquidity
              </motion.div>
            </Tab>
          </Tab.List>
          <Tab.Panels>
            <Tab.Panel>
              <AssetWrapper assetHook={swapHook}>
                <Swap />
              </AssetWrapper>
            </Tab.Panel>
            <Tab.Panel>
              <Liquidity />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </motion.div>
    </PoolWrapper>
  );
};

export default App;
