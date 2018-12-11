# Chainlist - Your classifieds on Ethereum

Sample Ethereum Dapp to create your classifieds on Ethereum.

This Dapp is linked to the course available on Udemy: https://www.udemy.com/getting-started-with-ethereum-solidity-development

Follow the steps described below to install, deploy and run the Dapp.

## Warning
**Make that you don't run your tests on the Ethereum's main net otherwise you will spend real ether with no chance to get it back**

## Prerequisites: Install tools and frameworks

To build, deploy and test your Dapp locally, you need to install the following tools and frameworks:
* **node.js and npm**: https://nodejs.org/en/
  * Node.js can be installed from an installation package or through some package managers such as Homebrew on a Mac.

* **Truffle**: https://github.com/trufflesuite/truffle
  * Create and deploy your Dapp with this build framework for Ethereum.
  
  In this sample, we use the beta version of Truffle 5 that you can install in this way:
  ```
  npm uninstall -g truffle
  npm install -g truffle@beta
  ```

* **Ganache**: https://github.com/trufflesuite/ganache
  * Development Ethereum node.


* **Metamask**: https://metamask.io/
  * Chrome extension to use Chrome as a Dapp browser.

## Step 1. Clone the project

`git clone https://github.com/chainskills/greetings-truffle5.git

## Step 2. Start your Ethereum node

Start Ganache. 

The first account will be the default account used to deploy your contract.

## Step 3. Configure your project

Edit your file `truffle-config.js` to set the port number used by Ganache.

## Step 4. Test your project

Truffle uses Mocha and Chain to run your tests.

```
$ truffle test --network ganache
```

## Step 5. Compile and deploy your smart contract

```
$ truffle migrate --reset --compile-all --network ganache
```

The output will provide you useful information such as the total cost of your deployment.

## Learn more

If you want to know more about all the steps required to build this Dapp step-by-step, you can subscribe to our course available on Udemy: https://www.udemy.com/getting-started-with-ethereum-solidity-development


Have fun !!!

ChainSkills Team - 2018
