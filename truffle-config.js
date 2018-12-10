const HDWalletProvider = require("truffle-hdwallet-provider");
require('dotenv').config();

module.exports = {
    // See <http://truffleframework.com/docs/advanced/configuration>
    // to customize your Truffle configuration!
    networks: {
        ganache: {
            host: "localhost",
            port: 7545,
            network_id: "*",
            websockets: true
        },
        chainskills: {
            host: "localhost",
            port: 8545,
            network_id: "4224"
        },
        ropsten: {
            provider: function() {
                return new HDWalletProvider(process.env.MNEMONIC, "https://ropsten.infura.io/v3/" + process.env.INFURA_PROJECT_ID);
            },
            network_id: 3,
            gas: 4500000,
            gasPrice: 10000000000
        }
    },
    // Configure your compilers
    compilers: {
        solc: {
            settings: {          // See the solidity docs for advice about optimization and evmVersion
                optimizer: {
                    enabled: true,
                    runs: 200
                }
            }
        }
    }
};
