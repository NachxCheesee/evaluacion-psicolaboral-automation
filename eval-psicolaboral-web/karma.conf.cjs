const fs = require('fs');

// Buscar automáticamente el ejecutable de Chrome o Edge (Chromium) en Windows
const posiblesRutas = [
  process.env.CHROME_BIN,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
];

const rutaEncontrada = posiblesRutas.find(ruta => ruta && fs.existsSync(ruta));
if (rutaEncontrada) {
  process.env.CHROME_BIN = rutaEncontrada;
}

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    files: [
      { pattern: 'src/data/**/*.js', type: 'module', included: false, served: true },
      { pattern: 'src/test/**/*.test.js', type: 'module', included: true, served: true }
    ],
    browsers: ['ChromeHeadlessPersonalizado'],
    customLaunchers: {
      ChromeHeadlessPersonalizado: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-gpu']
      }
    },
    singleRun: true,
    reporters: ['progress'],
    plugins: [
      'karma-jasmine',
      'karma-chrome-launcher'
    ]
  });
};