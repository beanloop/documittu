/// <reference types="webpack" />
import 'babel-polyfill'
import * as React from 'react'
import {render} from 'react-dom'
import {App} from './app'

export const SideMenuLayout = () => <span>Hello</span>

function requireAll(requireContext) {
  const pages = {}
  requireContext.keys().forEach(file => {
    pages[file] = requireContext(file)
  })
  return pages
}

export function start(context) {
  const pages = requireAll(context)
  function renderApp(App) {
    const root = document.getElementById('app')

    render(<App pages={pages} />, root)
  }

  if (window.document) {
    renderApp(App)
  }

  if (module['hot']) {
    module['hot'].accept('./app', () => {
      const UpdatedApp = require('./app').App
      setTimeout(() => renderApp(UpdatedApp))
    })
  }
}
