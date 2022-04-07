import _ from 'lodash';
import { E } from '@endo/captp';
import { useApplicationContext } from 'context/Application';
import AssetContext from 'context/AssetContext';
import React, { useContext, useEffect, useState, useRef } from 'react';
import { v4 } from 'uuid';
import AssetListItem from '../ListItem/AssetListItem';
import ListItem from '../ListItem/ListItem';
import SkeletonListItem from '../ListItem/SkeletonListItem';

const AssetDialog = ({ type, setSelectedAsset }) => {
  const mounted = useRef(false);
  // selected asset
  const [asset] = useContext(AssetContext);
  // get state
  const { state } = useApplicationContext();

  const [parsedAssets, setParsedAssets] = useState([]);

  // get assets from

  const {
    autoswap: { centralBrand },
  } = state;

  const refinedLiquidityBrands = async items => {
    let refinedItems = [];
    for await (const item of items) {
      // if component unmounted before completion
      if (mounted.current === false) {
        return;
      }
      const brandName = await E(item.brand).getAllegedName();
      // const type=await E(item.brand).get
      console.log('brandName', brandName);
      console.log('items:', refinedItems);
      if (!brandName.includes('Liquidity')) {
        refinedItems.push(item);
      }
    }
    refinedItems = refinedItems.filter(item => {
      return item.brand !== centralBrand;
    });
    setParsedAssets(refinedItems);
  };

  useEffect(() => {
    mounted.current = true;
    const { assets } = state;
    let refinedAssets;
    // if type secondary then we don't want to show centralBrand
    if (type === 'secondary') {
      console.log('Printing all the assets:', assets);
      refinedAssets = assets.filter(item => {
        return item.brand !== centralBrand;
      });
      refinedAssets = refinedAssets.filter(item => {
        if (Array.isArray(item.name)) {
          const name = item.name.join('.');
          return !name.includes('Liquidity');
        }
        return !item.name.includes('Liquidity');
      });
      setParsedAssets(refinedAssets);
    } else {
      console.log('Not secondary');
      refinedAssets = assets.filter(item => {
        if (Array.isArray(item.name)) {
          const name = item.name.join('.');
          return !name.includes('Liquidity');
        }
        return !item.name.includes('Liquidity');
      });
      setParsedAssets(refinedAssets);
    }
    // async refine liquidity assets through brands not names
    refinedLiquidityBrands(assets);

    return () => {
      mounted.current = false;
    };
  }, []);

  if (!parsedAssets.length)
    return (
      <div className="flex flex-col gap-4 p-5 overflow-auto ">
        {Array(4)
          .fill({})
          .map(() => (
            <ListItem key={v4()}>
              <SkeletonListItem />
            </ListItem>
          ))}
      </div>
    );

  return (
    <div className="flex flex-col gap-4 p-5 overflow-auto ">
      {parsedAssets?.map(item => (
        <div
          key={v4()}
          onClick={() => {
            setSelectedAsset({
              ...asset,
              [type]: item,
            });
          }}
        >
          <ListItem>
            <AssetListItem {...item} />
          </ListItem>
        </div>
      ))}
    </div>
  );
};

export default AssetDialog;
