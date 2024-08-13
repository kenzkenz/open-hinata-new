module.exports = {
  transpileDependencies: [
    // "ol",
    // "color-parse",
    "@cieloazul310/ol-gsi-vt",
    "@cieloazul310/ol-gsi-vt-style",
    "@cieloazul310/ol-gsi-vt-style-utils"
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
