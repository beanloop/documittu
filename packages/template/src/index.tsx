import 'babel-polyfill'
import * as React from 'react'
import {render} from 'react-dom'
import './assets/prism.css'
import {App} from './components/app'
import {ApiDocs} from './lib/entities'

function requireAll(requireContext) {
  const pages = {}
  requireContext.keys().forEach(file => {
    pages[file] = requireContext(file)
  })
  return pages
}

export type Options = {
  title: string
  pages?: any
  apiDocs?: ApiDocs
}

export function start({title, pages, apiDocs}: Options) {
  if (pages) {
    pages = requireAll(pages)
  }
  function renderApp(App) {
    const root = document.getElementById('app')

    render(<App title={title} pages={pages} apiDocs={apiDocs} />, root)
  }

  if (window.document) {
    renderApp(App)
  }

  if (module['hot']) {
    module['hot'].accept('./components/app', () => {
      const UpdatedApp = require('./components/app').App
      setTimeout(() => renderApp(UpdatedApp))
    })
  }
}

document.addEventListener('mouseup', event => {
  let target = event.target as HTMLElement
  while (target && target.tagName && target.tagName.toLowerCase() !== 'a') {
    target = target.parentElement as HTMLElement
  }
  if (target && target.tagName) {
    target.blur()
  }
})
