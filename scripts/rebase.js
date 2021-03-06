#!/usr/bin/env node

const argv = require('yargs') // eslint-disable-line
  .option('storedCurrentRate', {
    type: 'string',
    demandOption: true,
  })
  .option('storedTargetRate', {
    type: 'string',
    demandOption: true,
  })
  .option('network', {
    alias: 'n',
    type: 'string',
  })
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    default: false,
    description: 'Run with verbose logging',
  })
  .argv;

process.env.BUIDLER_NETWORK = argv['network'];
process.env.BUIDLER_SHOW_STACK_TRACES = true;
process.env.BUIDLER_VERBOSE = argv['verbose'];

// We require the Buidler Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
// When running the script with `buidler run <script>` you'll find the Buidler
// Runtime Environment's members available in the global scope.
const bre = require('@nomiclabs/buidler');
const { deployments, getNamedAccounts } = bre;
const { BN } = require('ethereumjs-util');

async function main() {
  await bre.run('compile');

  const { read, execute } = deployments;
  const { deployer, user } = await getNamedAccounts();

  const receipt = await execute('Orchestrator', { from: deployer }, 'rebase', argv['storedCurrentRate'], argv['storedTargetRate']);
  console.info('Rebase TX: ', `https://etherscan.io/tx/${receipt.transactionHash}`);

  const totalSupply = await read('Tracker', { from: user }, 'totalSupply');
  console.info('Total supply: ', totalSupply.toString());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
