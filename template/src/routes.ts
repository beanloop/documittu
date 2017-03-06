// import slug from 'slug'
import {Module as AnalyzerModule, Package as AnalyzerPackage} from 'documittu-analyzer-ts/src/index'
import {basename, dirname, join, normalize} from 'path'

function slug(a) {return a.replace(/[^a-zA-Z0-9-]/, '-').replace(/--/, '-')}

export function createUrl(attributes, path) {
  if (attributes.path) return attributes.path

  if (/^\.\/index\.md$/.test(path)) return '/'

  path = dirname(path.replace(/^\.\//, '/')).split('/').map(d => slug(d)).join('/')
  path += `/${slug(attributes.title)}`
  path = normalize(path).toLowerCase()

  return path
}

export type Module = AnalyzerModule & {url: string, typeUrls: {[typeId: string]: string}}
export type Package = AnalyzerPackage & {modules: {[path: string]: Module}}

export type Page = {
  url: string
  title: string
  attributes: any
  component: React.ReactType
}

export type FolderPageConfig = {
  url: string
  title: string
  subPages: Array<Page>
  redirectTo?: string
}

export type ModulePageConfig = {
  url: string
  title: string
  module: Module
  apiData: Package
  modules: Array<DocPage>
}

export type ModuleFolderConfig = {
  url: string
  modules: Array<DocPage>
}

export type TopLevel
  = ({kind: 'folder'} & FolderPageConfig)
  | ({kind: 'page'} & Page)
  | ({kind: 'redirect', url: string, title: undefined, to: string})
  | ({kind: 'module'} & ModulePageConfig)

export type DocPage
  = ({kind: 'module'} & ModulePageConfig)
  // | {kind: 'folder' & ModuleFolderConfig}

export function buildRoutes(pages, apiData: AnalyzerPackage) {
  let routes

  if (pages) {
    routes = buildPageRoutes(pages)
  }
  else if (apiData) {
    const context = apiData as Package
    routes = buildApiDataRoutes(context)
  }
  else {
    throw 'Neither pages nor apiData was provided'
  }

  return routes
}

function buildPageRoutes(pages) {
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

function buildApiDataRoutes(apiData: Package): TopLevel {
  const modules = [] as Array<DocPage>
  let rootModule: DocPage | undefined

  console.log('apiData.mainModule', apiData.mainModule)
  Object.values(apiData.modules)
    .forEach((module: Module) => {
      const url = apiData.mainModule === module.outPath ? '/' : join('/', module.outPath)
      if (!module.components.length && !module.types.length && url !== '/') return

      console.log('module.outPath', module.outPath)
      const title = apiData.mainModule === module.outPath
        ? apiData.name
        : basename(module.outPath).replace(/\.js$/, '')

      module.typeUrls = {}
      module.types.forEach(type => {
        module.typeUrls[type.id] = join(url, `type.${type.name}`)
      })

      const modulePage: DocPage = {
        kind: 'module',
        title,
        url,
        module,
        apiData,
        modules: [],
      }

      if (url === '/') {
        modulePage.modules = modules
        rootModule = modulePage
      } else {
        modules.push(modulePage)
      }
    })

  if (rootModule) {
    return [rootModule]
  }
  throw 'No module with main'
}
