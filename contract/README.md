This is a copy of the AMM contract extracted from [agoric-sdk][1] as
of 2023-02-28 `70ba9b0ce`.

[1]: https://github.com/Agoric/agoric-sdk

## Tests not working

A number of the tests do **not** pass; they have dependencies on
agoric-sdk that did not survive the extraction. For example, a
dependency on part of `@agoric/zoe` that is not exported:

```
$ yarn test
yarn run v1.22.4
$ ava

  Uncaught exception in test/test-feeDistributor.js

  Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/home/connolly/projects/dapp-amm/contract/node_modules/@agoric/zoe/test/unitTests/setupBasicMints.js' imported from /home/connolly/projects/dapp-amm/contract/test/test-feeDistributor.js
```
