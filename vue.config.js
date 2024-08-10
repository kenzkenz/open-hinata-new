module.exports = {
  //  ビルドしたときのパス 空文字にして相対パスにする。
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
