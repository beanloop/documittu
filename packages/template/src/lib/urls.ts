import {Module, Reexport, UntaggedDeclaration} from 'documittu-analyzer-ts'
import {join} from 'path'
import {ApiDocs} from './entities'

export const defaultTitle = 'API Documentation'

export const rootUrl = (apiDocs: ApiDocs) => apiDocs.url || '/docs'

export function moduleUrl(module: Module, apiDocs: ApiDocs) {
  return apiDocs.data.mainModule === module.outPath
    ? rootUrl(apiDocs)
    : join(rootUrl(apiDocs), module.outPath)
}

export function entryUrl(declaration: UntaggedDeclaration & {reexport?: Reexport}, module: Module, apiDocs: ApiDocs) {
  if (declaration.reexport) {
    module = apiDocs.data.modules[declaration.reexport.path]
  }
  let taggedDeclaration = module.declarations[declaration.id]
  const kind = taggedDeclaration.kind.toLowerCase()
  return join(moduleUrl(module, apiDocs), `${kind}.${declaration.name}`)
}
