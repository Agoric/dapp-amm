import { E } from '@endo/eventual-send';
import { Far } from '@endo/marshal';
import { AmountMath } from '@agoric/ertp';
import { makeNotifierFromSubscriber } from '@agoric/notifier';
import { TimeMath } from '@agoric/time';

import { daysForVoting } from './bootstrap';
import { ONE_DAY } from '../setup';

const { Fail, quote: q } = assert;

/** @typedef {import('../../../src/vaultFactory/vaultFactory').VaultFactoryContract} VFC */

/**
 *
 * @param {(msg: any)=> void} log
 * @param {ZoeService} zoe
 * @param {Brand[]} brands
 * @param {Payment[]} payments
 * @param {ManualTimer} timer configured to tick one day (@see setup.js)
 * @returns {Promise<{startTest: Function}>}
 */
const build = async (log, zoe, brands, payments, timer) => {
  const [moolaBrand] = brands;
  const [moolaPayment] = payments;

  /**
   * @param {VFC['publicFacet']} vaultFactory
   */
  const oneLoanWithInterest = async vaultFactory => {
    log(`=> alice.oneLoanWithInterest called`);

    const runIssuer = await E(vaultFactory).getRunIssuer();
    const runBrand = await E(runIssuer).getBrand();

    const collateralManager = E(vaultFactory).getCollateralManager(moolaBrand);

    /** @type {UserSeat<VaultKit>} */
    const loanSeat = await E(zoe).offer(
      E(collateralManager).makeVaultInvitation(),
      harden({
        give: { Collateral: AmountMath.make(moolaBrand, 100n) },
        want: { RUN: AmountMath.make(runBrand, 500000n) },
      }),
      harden({
        Collateral: moolaPayment,
      }),
    );

    const assetNotifier = makeNotifierFromSubscriber(
      E(collateralManager).getSubscriber(),
    );
    const { vault } = await E(loanSeat).getOfferResult();

    const timeLog = async msg =>
      log(
        `at ${
          TimeMath.absValue(await E(timer).getCurrentTimestamp()) / ONE_DAY
        } days: ${msg}`,
      );

    let lastAssetN = await E(assetNotifier).getUpdateSince();
    const assetUpdate = async () => {
      lastAssetN = await E(assetNotifier).getUpdateSince(
        lastAssetN.updateCount,
      );
      return `assetNotifier update #${lastAssetN.updateCount} has interestRate.numerator ${lastAssetN.value.interestRate.numerator.value}`;
    };

    await timeLog(`Alice owes ${q(await E(vault).getCurrentDebt())}`);

    // accrue one day of interest at initial rate
    await E(timer).tick();
    await assetUpdate();
    await timeLog(`Alice owes ${q(await E(vault).getCurrentDebt())}`);

    // advance time enough that governance updates the interest rate
    await Promise.all(new Array(daysForVoting).fill(E(timer).tick()));
    await timeLog('vote ready to close');
    await assetUpdate();
    await timeLog(`Alice owes ${q(await E(vault).getCurrentDebt())}`);

    await E(timer).tick();
    await timeLog('vote closed');
    await assetUpdate();
    await timeLog(`Alice owes ${q(await E(vault).getCurrentDebt())}`);

    const uiDescription = () => {
      return `assetNotifier update #${lastAssetN.updateCount} has interestRate.numerator ${lastAssetN.value.interestRate.numerator.value}`;
    };

    await timeLog(`1 day after votes cast, ${uiDescription()}`);
    await E(timer).tick();
    await assetUpdate();
    await timeLog(`2 days after votes cast, ${uiDescription()}`);
    await assetUpdate();
    await timeLog(`Alice owes ${q(await E(vault).getCurrentDebt())}`);
  };

  return Far('build', {
    /**
     * @param {string} testName
     * @param {VFC['publicFacet']} vaultFactory
     * @returns {Promise<void>}
     */
    startTest: async (testName, vaultFactory) => {
      switch (testName) {
        case 'oneLoanWithInterest': {
          return oneLoanWithInterest(vaultFactory);
        }
        default: {
          throw Fail`testName ${testName} not recognized`;
        }
      }
    },
  });
};

/** @type {BuildRootObjectForTestVat} */
export function buildRootObject(vatPowers) {
  return Far('root', {
    build: (zoe, brands, payments, timer) =>
      build(vatPowers.testLog, zoe, brands, payments, timer),
  });
}
