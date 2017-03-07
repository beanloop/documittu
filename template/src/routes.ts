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

export type Module = AnalyzerModule & {typeUrls: {[typeId: string]: string}}
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
  modules: Array<ModulePageConfig>
}

export type TopLevel
  = ({kind: 'folder'} & FolderPageConfig)
  | ({kind: 'page'} & Page)
  | ({kind: 'redirect', url: string, title: undefined, to: string})
  | ({kind: 'module'} & ModulePageConfig)

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

function buildApiDataRoutes(apiData: Package): Array<TopLevel> {
  const modules = {} as {[dirnmame: string]: Array<ModulePageConfig>}
  const indexModules = {} as {[dirnmame: string]: ModulePageConfig}
  let rootModule: ModulePageConfig | undefined

  console.log('apiData.mainModule', apiData.mainModule)
  Object.values(apiData.modules)
    .forEach((module: Module) => {
      const url = apiData.mainModule === module.outPath ? '/' : join('/', module.outPath)
      if (
        !module.components.length &&
        !module.types.length &&
        !module.classes.length &&
        !module.functions.length &&
        !module.variables.length &&
        url !== '/'
      ) return

      console.log('module.outPath', module.outPath)
      const title = apiData.mainModule === module.outPath
        ? apiData.name
        : basename(module.outPath).replace(/\.js$/, '')

      module.typeUrls = {}
      module.types.forEach(type => {
        if (!apiData.declarationModule[type.id]) {
          apiData.declarationModule[type.id] = module.outPath
        }

        module.typeUrls[type.id] = join(url, `type.${type.name}`)
      })
      module.classes.forEach(type => {
        if (!apiData.declarationModule[type.id]) {
          apiData.declarationModule[type.id] = module.outPath
        }

        module.typeUrls[type.id] = join(url, `class.${type.name}`)
      })

      const modulePage: ModulePageConfig = {
        title,
        url,
        module,
        apiData,
        modules: [],
      }

      if (url === '/') {
        rootModule = modulePage
      } else {
        const dir = dirname(module.outPath)
        if (modules[dir]) {
          modules[dir].push(modulePage)
        } else {
          modules[dir] = [modulePage]
        }
      }
    })

  let dirs = Object.keys(modules)
  if (dirs.length > 0) {
    const path = dirs[0].split('/')
    for (const dir of path) {
      if (dirs.every(d => d.startsWith(`${dir}/`))) {
        dirs = dirs.map(d => {
          const updatedPath = d.slice(dir.length + 1)
          modules[updatedPath] = modules[d]
          delete modules[d]

          return updatedPath
        })
      }
      else break
    }
    for (const dir of dirs) {
      let url, outPath
      for (const module of modules[dir]) {
        if (module.module.outPath.endsWith('/index.js')) {
          indexModules[dir] = module
          break
        }
        else {
          url = module.url
          outPath = module.module.outPath
        }
      }
      if (!indexModules[dir]) {
        indexModules[dir] = {
          title: basename(dir),
          url: dirname(url),
          module: {
            srcPath: '',
            outPath: join(dirname(outPath), 'index.js'),
            typeUrls: {},
            components: [],
            types: [],
            classes: [],
            functions: [],
            variables: [],
          },
          apiData,
          modules: modules[dir],
        }
      }
    }
  }
  // Sort the keys with longest first first so we visit the most nested path first
  let indexModulePaths = Object.keys(indexModules).sort((a, b) => b.length - a.length)
  for (const path of indexModulePaths) {
    // Find the parents and sort them with longest first so that parents[0] is the direct parent
    const parents = indexModulePaths.filter(d => path.startsWith(`${d}/`))
      .sort((a, b) => b.length - a.length)

    if (parents.length > 0) {
      // Push this module into the parents modules and remove it from what will be the root modules
      indexModules[parents[0]].modules.push(indexModules[path])
      delete indexModules[path]
    }
  }

  if (rootModule) {
    rootModule.modules = Object.values(indexModules)
    return [{kind: 'module' as 'module', ...rootModule}]
  }
  else {
    return [{
      kind: 'module',
      title: apiData.name,
      url: '/',
      module: {
        srcPath: '',
        outPath: '',
        typeUrls: {},
        components: [],
        types: [],
        classes: [],
        functions: [],
        variables: [],
      },
      apiData,
      modules: Object.values(indexModules),
    }]
  }
}
