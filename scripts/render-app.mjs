import { register } from 'esbuild-register/dist/node.js'
const { unregister } = register({ extensions: ['.js', '.jsx'] })

import { JSDOM } from 'jsdom'
import React from 'react'
import { createRoot } from 'react-dom/client'

const { default: App } = await import('../src/App.jsx')

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost/',
})

global.window = dom.window
Object.assign(global, {
  document: dom.window.document,
  navigator: dom.window.navigator,
  location: dom.window.location,
  HTMLElement: dom.window.HTMLElement,
  CustomEvent: dom.window.CustomEvent,
  getComputedStyle: dom.window.getComputedStyle,
  requestAnimationFrame: dom.window.requestAnimationFrame ?? ((cb) => setTimeout(cb, 0)),
  cancelAnimationFrame: dom.window.cancelAnimationFrame ?? ((id) => clearTimeout(id)),
})

dom.window.history.replaceState({}, '', 'http://localhost/')

const container = document.getElementById('root')
const root = createRoot(container)

root.render(React.createElement(App))

setTimeout(() => {
  console.log('Rendered App without crashing')
  unregister()
}, 1000)
