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
            port: 8546,
            network_id: "4224", 
            websockets: true
        }
    }
};
