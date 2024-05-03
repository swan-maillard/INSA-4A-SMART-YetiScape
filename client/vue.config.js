const { defineConfig } = require("@vue/cli-service");
/*
module.exports = defineConfig({
  transpileDependencies: true,
});
*/
const fs = require('fs')

module.exports = defineConfig({
    transpileDependencies: true,
    devServer: {
        https: {
          key: fs.readFileSync('./src/cert/key.pem'),
          cert: fs.readFileSync('./src/cert/cert.pem')
        },
        host: 'localhost',
        port: 8080, // CHANGE YOUR PORT HERE!
        https: true,
    }
})