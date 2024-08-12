module.exports = {
  transpileDependencies: [
    // "ol",
    // "color-parse",
    "@cieloazul310/ol-gsi-vt",
  ],
  publicPath: process.env.NODE_ENV === 'production' ? '' : '',
  pwa: {
    iconPaths: {
      favicon32: 'favicon.ico',
    }
  },
  configureWebpack: {
    plugins: [
    ]
  }
}
