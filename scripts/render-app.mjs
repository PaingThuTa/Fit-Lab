import { register } from 'esbuild-register/dist/node.js'
import { createRequire } from 'module'
import { JSDOM } from 'jsdom'
import React from 'react'
import { createRoot } from 'react-dom/client'

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost/',
})

global.window = dom.window
global.document = dom.window.document
global.location = dom.window.location
global.HTMLElement = dom.window.HTMLElement
global.CustomEvent = dom.window.CustomEvent
global.getComputedStyle = dom.window.getComputedStyle
global.requestAnimationFrame = dom.window.requestAnimationFrame ?? ((cb) => setTimeout(cb, 0))
global.cancelAnimationFrame = dom.window.cancelAnimationFrame ?? ((id) => clearTimeout(id))
Object.defineProperty(global, 'navigator', {
  value: dom.window.navigator,
  configurable: true,
})

dom.window.history.replaceState({}, '', 'http://localhost/')

const { unregister } = register({
  extensions: ['.js', '.jsx'],
  format: 'cjs',
  target: 'es2020',
  jsx: 'automatic',
  logLevel: 'silent',
})
const require = createRequire(import.meta.url)
const App = require('../src/App.jsx').default

const container = document.getElementById('root')
const root = createRoot(container)

root.render(React.createElement(App))

setTimeout(() => {
  console.log('Rendered App without crashing')
  unregister()
}, 1000)
