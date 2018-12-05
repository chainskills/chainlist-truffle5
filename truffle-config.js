module.exports = {
    // See <http://truffleframework.com/docs/advanced/configuration>
    // to customize your Truffle configuration!
    networks: {
        ganache: {
            host: "localhost",
            port: 7545,
            network_id: "*" // Match any network id
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
