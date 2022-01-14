import PoolContext from 'context/PoolContext';
import Loader from 'react-loader-spinner';
import { useApplicationContext } from 'context/Application';
import React, {
  useState,
  useEffect,
  useContext,
  useMemo,
  useCallback,
} from 'react';
import { v4 } from 'uuid';

import { getInfoForBrand } from 'utils/helpers';
import { stringifyNat } from '@agoric/ui-components/dist/display/natValue/stringifyNat';
import { motion } from 'framer-motion';

import HeaderLiquidityPool from './HeaderLiquidityPool';
import ItemLiquidityPool from './ItemLiquidityPool';

// decimal places to show in input
const PLACES_TO_SHOW = 2;
const ALL = 'ALL';
const YOURS = 'YOURS';

const BodyLiquidityPool = props => {
  const [loadUserLiquidityPools, setLoadUserLiquidityPools] = useState(true);
  const [loadAllLiquidityPools, setLoadAllLiquidityPools] = useState(true);
  const [pool] = useContext(PoolContext);
  const [updatedPool, setUpdatedPool] = useState([]);
  const [userPool, setUserPool] = useState([]);
  const [user, setUser] = useState(true);
  const { state } = useApplicationContext();
  const { brandToInfo } = state;
  const newPool = useMemo(() => {
    return pool?.allocations?.map(item => {
      const central = item.Central;
      const secondary = item.Secondary;
      const centralInfo = getInfoForBrand(brandToInfo, central.brand);
      const secondaryInfo = getInfoForBrand(brandToInfo, secondary.brand);
      const centralValString = stringifyNat(
        central.value,
        centralInfo.decimalPlaces,
        PLACES_TO_SHOW,
      );
      const secondaryValString = stringifyNat(
        secondary.value,
        secondaryInfo.decimalPlaces,
        PLACES_TO_SHOW,
      );
      return {
        Central: { info: centralInfo, value: centralValString },
        Secondary: { info: secondaryInfo, value: secondaryValString },
      };
    });
  }, [pool.allocations]);
  const newUserPairs = useMemo(() => {
    return pool.userPairs
      ? pool.userPairs?.map(pair => {
          const central = pair.Central;
          const secondary = pair.Secondary;

          const centralInfo = getInfoForBrand(brandToInfo, central.brand);
          const secondaryInfo = getInfoForBrand(brandToInfo, secondary.brand);

          const centralValString = stringifyNat(
            central.value,
            centralInfo.decimalPlaces,
            PLACES_TO_SHOW,
          );
          const secondaryValString = stringifyNat(
            secondary.value,
            secondaryInfo.decimalPlaces,
            PLACES_TO_SHOW,
          );
          return {
            Central: { info: centralInfo, value: centralValString },
            Secondary: { info: secondaryInfo, value: secondaryValString },
            User: {
              share: pair.percentShare,
              brand: pair.brand,
              userLiquidityNAT: pair.userLiquidityNAT,
              totaLiquidity: pair.value,
            },
          };
        })
      : [];
  }, [pool.userPairs]);
  useEffect(() => {
    console.log('user status,', pool.userLiquidityStatus);
    if (pool.userLiquidityStatus === 200) {
      console.log('useEffect Users');
      console.log('User Liquidity Pools Loaded:', pool.userPairs);
      setUserPool(newUserPairs);
      newUserPairs?.length > 0 &&
        userPool?.length > 0 &&
        setLoadUserLiquidityPools(false);
    } else {
      !user && setLoadUserLiquidityPools(false);
    }
  }, [pool.userPairs, user]);
  useEffect(() => {
    const updatePools = () => {
      setUpdatedPool(newPool);
    };
    console.log('useEffect Pool:', pool);
    if (pool?.allLiquidityStatus === 200) {
      console.log('All Liquidity Pools Loaded:', pool.allocations);
      pool.allocations && updatePools();
      if (newPool?.length > 0) {
        setLoadAllLiquidityPools(false);
        setUser(pool.allocations.some(item => item.User));
      }
    }
  }, [pool.allocations]);
  return (
    <>
      <HeaderLiquidityPool type="yours" />
      <motion.div className="flex flex-col p-5 gap-6 ">
        {userPool?.length ? (
          userPool?.map(item => (
            <ItemLiquidityPool
              key={v4()}
              {...item}
              type={YOURS}
              item={item}
              {...props}
            />
          ))
        ) : (
          <>
            {' '}
            {!loadUserLiquidityPools && (
              <h4 className="text-lg">You have no liquidity positions.</h4>
            )}
          </>
        )}
        {loadUserLiquidityPools && newUserPairs?.length === 0 ? (
          <div className="flex flex-row justify-left items-center text-gray-400">
            <Loader type="Oval" color="#62d2cb" height={15} width={15} />
            <div className="pl-2 text-lg">Fetching user liquidity pools...</div>
          </div>
        ) : (
          <></>
        )}
      </motion.div>
      <HeaderLiquidityPool type="all" />
      <motion.div className="flex flex-col p-5 gap-6 ">
        {updatedPool.length ? (
          updatedPool?.map(item => (
            <ItemLiquidityPool
              key={v4()}
              {...item}
              type={ALL}
              item={item}
              {...props}
            />
          ))
        ) : (
          <>
            {' '}
            {!loadAllLiquidityPools && (
              <h4 className="text-lg">Liquidity positions not found.</h4>
            )}
          </>
        )}
        {loadAllLiquidityPools ? (
          <div className="flex flex-row justify-left items-center text-gray-400">
            <Loader type="Oval" color="#62d2cb" height={15} width={15} />
            <div className="pl-2 text-lg">Fetching all liquidity pools...</div>
          </div>
        ) : (
          <></>
        )}
      </motion.div>
    </>
  );
};

export default BodyLiquidityPool;
