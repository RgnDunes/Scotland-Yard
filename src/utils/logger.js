const isDev = import.meta.env.DEV

export const logger = {
  log: (...args) => isDev && console.log(...args), // eslint-disable-line no-console
  warn: (...args) => isDev && console.warn(...args), // eslint-disable-line no-console
  error: (...args) => console.error(...args), // eslint-disable-line no-console
}
