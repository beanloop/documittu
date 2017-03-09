import {
  ClassDeclaration,
  ComponentDeclaration,
  FunctionDeclaration,
  Module,
  Package,
  Reexport,
  TypeDeclaration,
  VariableDeclaration
} from 'documittu-analyzer-ts'

export type ApiDocs = {
  data: Package
  title?: string
  url?: string
}

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
  apiDocs: ApiDocs
  modules: Array<ModulePageConfig>

  components: Array<ComponentDeclaration & {reexport?: Reexport}>
  types: Array<TypeDeclaration & {reexport?: Reexport}>
  classes: Array<ClassDeclaration & {reexport?: Reexport}>
  functions: Array<FunctionDeclaration & {reexport?: Reexport}>
  variables: Array<VariableDeclaration & {reexport?: Reexport}>
}

export type TopLevel
  = ({kind: 'folder'} & FolderPageConfig)
  | ({kind: 'page'} & Page)
  | ({kind: 'redirect', url: string, title: undefined, to: string})
  | ({kind: 'module'} & ModulePageConfig)
