import React, { useState, useEffect } from 'react';
import { setToast } from 'utils/helpers';
import { useApplicationContext } from 'context/Application';
import 'react-toastify/dist/ReactToastify.css';
import 'styles/globals.css';
import agoricLogo from 'assets/agoric-logo1.svg';
import Swap from 'components/Swap/Swap';
import { Tab } from '@headlessui/react';
import clsx from 'clsx';
import Liquidity from 'components/Liquidity/Liquidity';
import PoolWrapper from 'context/PoolWrapper';
import SwapWrapper from 'context/SwapWrapper';
import { motion } from 'framer-motion';
import WalletToast from 'components/Wallet/WalletToast';
import InformationToast from 'components/components/InformationToast';
import WalletConnection from 'components/components/WalletConnection';

const App = () => {
  const [index, setIndex] = useState(0);
  const { state, setWalletP, dispatch } = useApplicationContext();
  useEffect(() => {
    if (state?.error?.name) {
      setToast(state.error.name, 'warning', {
        position: 'top-right',
        autoClose: false,
        containerId: 'Info',
      });
    }
  }, [state?.error]);

  return (
    <PoolWrapper>
      <SwapWrapper>
        <InformationToast />
        <WalletToast />
        <motion.div className="min-h-screen container px-4 mx-auto py-6 flex flex-col items-center relative">
          <img
            src={agoricLogo}
            alt="Agoric Logo"
            className="absolute pl-0 -top-2 left-0 m-7"
          />
          <div className="absolute p-0 top-3 right-0 m-2">
            <WalletConnection setWalletP={setWalletP} dispatch={dispatch} />
          </div>
          <Tab.Group
            defaultIndex={0}
            onChange={i => {
              setIndex(i);
              console.log(i);
            }}
          >
            <Tab.List className="mt-10 md:mt-0 bg-white p-2 text-md shadow-red-light-sm rounded-sm mb-20 transition-all duration-300 ease-in-out">
              <Tab>
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={clsx(
                    'tab font-medium',
                    index === 0 ? 'bg-alternative' : 'bg-white',
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
                    index === 1 ? 'bg-alternative' : 'bg-white',
                  )}
                >
                  Liquidity
                </motion.div>
              </Tab>
            </Tab.List>
            <Tab.Panels>
              <Tab.Panel>
                <Swap />
              </Tab.Panel>
              <Tab.Panel>
                <Liquidity />
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </motion.div>
      </SwapWrapper>
    </PoolWrapper>
  );
};

export default App;
