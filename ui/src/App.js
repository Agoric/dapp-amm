import React, { useState } from 'react';
import 'styles/globals.css';
import agoricLogo from 'assets/agoric-logo.svg';
import Swap from 'components/Swap/Swap';
import AssetWrapper from 'context/AssetWrapper';
import { Tab } from '@headlessui/react';
import clsx from 'clsx';
import Liquidity from 'components/Liquidity/Liquidity';
import PoolWrapper from 'context/PoolWrapper';
import { motion } from 'framer-motion';

const App = () => {
  const [index, setIndex] = useState(0);

  const swapHook = useState({ from: null, to: null });

  return (
    <PoolWrapper>
      <motion.div
        className=" min-h-screen container px-4 mx-auto  py-6 flex flex-col  items-center relative"
        layout
      >
        <img
          src={agoricLogo}
          alt="Agoric Logo"
          className="absolute top-0 left-0  py-6  px-6 "
        />
        <Tab.Group defaultIndex={0} onChange={i => setIndex(i)}>
          <Tab.List className="bg-white p-2 text-md shadow-red-light-sm rounded-sm mb-20 transition-all duration-300 ease-in-out">
            <Tab className={''}>
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
