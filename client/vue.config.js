const { defineConfig } = require("@vue/cli-service");
const fs = require('fs')

module.exports = defineConfig({
    transpileDependencies: true,
    devServer: {
        https: {
          key: fs.readFileSync('./src/cert/key.pem'),
          cert: fs.readFileSync('./src/cert/cert.pem')
        },
        host: '0.0.0.0',
        port: 8080, // CHANGE YOUR PORT HERE!
        https: true,
    }
})
