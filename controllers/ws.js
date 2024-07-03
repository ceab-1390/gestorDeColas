const websockets = {};

module.exports = {
    setWs: (key, ws) => {
        websockets[key] = ws;
        console.log('SetWs')
    },
    getWs: (key) => {
        console.log('GetWs')
        return websockets[key];
    }
};