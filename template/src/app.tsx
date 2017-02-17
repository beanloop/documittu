import {dirname, normalize} from 'path'
import * as React from 'react'
import slug from 'slug'
import {ThemeProvider} from 'react-css-themr'
import {BrowserRouter, Link} from 'react-router-dom'
import Route from 'react-router/Route'
import {AppBar} from 'react-toolbox/lib/app_bar'
import Navigation from 'react-toolbox/lib/navigation'
import {theme} from './theme'

function url(attributes, path) {
  if (attributes.path) return attributes.path

  path = dirname(path.replace(/^\.\//, '/'))
  path += `/${slug(attributes.title.toLowerCase())}`
  path = normalize(path)
  console.log('url', path)

  return path
}

function topLevelFilter([file, {attributes}]) {
  console.log('url(attributes, file).slice(1, -1)', url(attributes, file).slice(1, -1))
  return url(attributes, file).slice(1, -1).indexOf('/') === -1
}

export const App = ({pages}) =>(console.log('pages', pages),
  <ThemeProvider theme={theme}>
    <BrowserRouter>
      <div>
        <AppBar title='Documittu'>
          <Navigation type='horizontal'>
            {Object.entries(pages)
              .filter(topLevelFilter)
              .map(([path, {attributes}], i) =>
              <Link key={i} to={url(attributes, path)}>
                {attributes.title}
              </Link>
            )}
          </Navigation>
        </AppBar>
        {Object.entries(pages).map(([path, {attributes}], i) =>
          <Link key={i} to={url(attributes, path)}>
            {attributes.title}
          </Link>
        )}
        {Object.entries(pages)
          .map(([path, {attributes, default: Component}], i) =>
          <Route key={i} path={url(attributes, path)}
            render={() => <div>
              On {attributes.title}
              <Component />
            </div>}
          />
        )}
      </div>
    </BrowserRouter>
  </ThemeProvider>)

