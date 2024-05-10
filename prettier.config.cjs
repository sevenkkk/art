module.exports = {
  plugins: [],
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 120,
  tabWidth: 4,
  useTabs: true,
  endOfLine: 'auto',
  // 让prettier使用eslint的代码格式进行校验
  eslintIntegration: true,
  // 让prettier使用stylelint的代码格式进行校验
  stylelintIntegration: true,
  arrowParens: 'always',
  jsxBracketSameLine: true,
  htmlWhitespaceSensitivity: 'ignore',
  bracketSpacing: true
}
