import { makeReactAgoricWalletConnection } from '@agoric/web-components/react';
import React, { useCallback } from 'react';
import { E } from '@endo/eventual-send';

import { dappConfig } from '../../utils/config';
import { setApproved } from '../../store/store';

// Create a wrapper for agoric-wallet-connection that is specific to
// the app's instance of React.
const AgoricWalletConnection = makeReactAgoricWalletConnection(React);

const WalletConnection = ({ setWalletP, dispatch }) => {
  const { CONTRACT_NAME } = dappConfig;

  const onWalletState = useCallback(ev => {
    const { walletConnection, state } = ev.detail;
    console.log('wallet:', state);
    switch (state) {
      case 'idle': {
        // This is one of the only methods that the wallet connection facet allows.
        // It connects asynchronously, but you can use promise pipelining immediately.
        /** @type {ERef<WalletBridge>} */
        const bridge = E(walletConnection).getScopedBridge(CONTRACT_NAME);
        // You should reconstruct all state here.
        setWalletP(bridge);
        break;
      }
      case 'approving': {
        dispatch(setApproved(false));
        break;
      }
      case 'bridged': {
        dispatch(setApproved(true));
        break;
      }
      case 'error': {
        dispatch(setApproved(false));
        console.log('error', ev.detail);
        // In case of an error, reset to 'idle'.
        // Backoff or other retry strategies would go here instead of immediate reset.
        E(walletConnection).reset();
        break;
      }
      default:
    }
  }, []);

  return (
    <AgoricWalletConnection onState={onWalletState} useLocalStorage={true} />
  );
};

export default WalletConnection;
