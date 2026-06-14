module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    // O plugin do worklets precisa ser sempre o último da lista.
    plugins: ['react-native-worklets/plugin'],
  };
};
