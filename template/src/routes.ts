import {dirname, normalize} from 'path'
import slug from 'slug'

export function createUrl(attributes, path) {
  if (attributes.path) return attributes.path

  if (/^\.\/index\.md$/.test(path)) return '/'

  path = dirname(path.replace(/^\.\//, '/')).split('/').map(d => slug(d)).join('/')
  path += `/${slug(attributes.title)}`
  path = normalize(path).toLowerCase()

  return path
}

export type Page = {
  url: string
  title: string
  attributes: any
  component: React.ReactType
}

export type FolderPage = {
  url: string
  title: string
  subPages: Array<Page>
  redirectTo?: string
}

export type TopLevel
  = ({kind: 'folder'} & FolderPage)
  | ({kind: 'page'} & Page)
  | ({kind: 'redirect', url: string, title: undefined, to: string})

export function buildRoutes(pages) {
  const routes = [] as Array<TopLevel>
  const subRoutes = {} as {[folder: string]: Array<Page>}
  const subRoutesWithoutIndex = {} as {[folder: string]: true}
  let hasIndex = false

  Object.entries(pages)
    .forEach(([path, {attributes, default: component}]) => {
      let url = createUrl(attributes, path)
      const urlParts = url.split('/')
      if (urlParts.length === 2) {
        if (url === '/') {
          hasIndex = true
        }
        routes.push({
          kind: 'page',
          url,
          title: attributes.title,
          attributes,
          component,
        })
      }
      else if (urlParts.length === 3) {
        const [, folder] = path.split('/')
        if (!subRoutes[folder]) {
          subRoutes[folder] = []
          subRoutesWithoutIndex[folder] = true
        }
        if (/index\.md$/.test(path)) {
          url = `/${folder}`
          delete subRoutesWithoutIndex[folder]
          routes.push({
            kind: 'folder',
            title: attributes.title,
            url,
            subPages: subRoutes[folder],
          })
        }
        subRoutes[folder].push({
          url,
          title: attributes.title,
          attributes,
          component,
        })
      }
      else {
        throw Error('Nested directories are not supported')
      }
    })

  Object.keys(subRoutesWithoutIndex)
    .forEach(folder => {
      routes.push({
        kind: 'folder',
        title: folder,
        url: `/${folder}`,
        subPages: subRoutes[folder],
        redirectTo: subRoutes[folder][0].url,
      })
    })

  if (!hasIndex) {
    routes.push({kind: 'redirect', url: '/', title: undefined, to: routes[0].url})
  }

  return routes
}
