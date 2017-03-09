import 'babel-polyfill'
import * as React from 'react'
import {render} from 'react-dom'
// import apiDocs from './analyze-result.json'
import './assets/prism.css'
import {App} from './components/app'
import {ApiDocs} from './lib/entities'

export const SideMenuLayout = () => <span>Fork!</span>

function requireAll(requireapiDocs) {
  const pages = {}
  requireapiDocs.keys().forEach(file => {
    pages[file] = requireapiDocs(file)
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

// start({
//   title: 'test',
//   // apiDocs,
// })
