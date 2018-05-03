// http://eslint.org/docs/user-guide/configuring
module.exports = {
  root: true,
  parser: "babel-eslint",
  parserOptions: {
    sourceType: "module"
  },
  env: {
    browser: true
  },
  // required to lint *.vue files
  plugins: ["vue", "html"],
  // forcing to recognise .vue files
  settings: {
    "import/resolver": {
      webpack: {
        config: "./build/webpack.base.conf.js"
      }
    }
  },
  // add your custom rules here
  rules: {
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'handle-callback-err': 0,
    'camelcase': ['error', {properties: 'never'}],
    'indent': [0]
  }
}
