const webpack = require('webpack');

module.exports = function override(config, env) {
  // Node.js 폴리필 설정
  config.resolve.fallback = {
    fs: false,
    path: require.resolve('path-browserify'),
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    assert: require.resolve('assert'),
    buffer: require.resolve('buffer'),
    process: require.resolve('process/browser'),
    vm: require.resolve('vm-browserify'),
    url: require.resolve('url')
  };

  // process 폴리필을 위한 플러그인 설정
  config.plugins.push(
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.NormalModuleReplacementPlugin(
      /node:process/,
      'process/browser'
    )
  );

  // webpack 5에서 폴리필 자동 추가 비활성화 문제 해결
  config.resolve.alias = {
    ...config.resolve.alias,
    'process/browser': require.resolve('process/browser')
  };

  return config;
};
