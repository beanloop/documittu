import {Module, Package, Reexport, UntaggedDeclaration} from 'documittu-analyzer-ts'
import {join} from 'path'


export function moduleUrl(module: Module, context: Package) {
  return context.mainModule === module.outPath ? '/' : join('/', module.outPath)
}

export function entryUrl(declaration: UntaggedDeclaration & {reexport?: Reexport}, module: Module, context: Package) {
  if (declaration.reexport) {
    module = context.modules[declaration.reexport.path]
  }
  declaration = module.declarations[declaration.id]
  const kind = declaration.kind.toLowerCase()
  return join(moduleUrl(module, context), `${kind}.${declaration.name}`)
}
