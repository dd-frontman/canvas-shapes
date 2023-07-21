const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  compilerOptions: {
    refUnwrapBrs: true
  }
})
