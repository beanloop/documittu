import {DocEntry, Module, Package, Reexport, TypeProperty, UntaggedDeclaration} from 'documittu-analyzer-ts'
import {join} from 'path'
import * as React from 'react'
import ReactMarkdown from 'react-markdown'
import {PrismCode} from 'react-prism'
import {Link} from 'react-router-dom'
import styled from 'styled-components'
import {materialColors} from 'styled-material/dist/src/colors'
import {entryUrl, moduleUrl} from '../../lib/urls'
import {Keyword, PropertyName, StringLiteral} from './syntax'
import {Type} from './types'

export const DocListItem = ({item, context, children}: {item: {reexport?: Reexport}, context: Package, children?: any}) =>
  <div>
    {children}
    {item.reexport && <Reexported reexport={item.reexport} context={context} />}
  </div>

export const Reexported = ({reexport, context}: {reexport: Reexport, context: Package}) => {
  const module = context.modules[reexport.path]
  if (!module) return <span />

  return (
    <p style={{color: 'rgba(0, 0, 0, 0.54)'}}>
      Exported from{' '}
      <Link to={moduleUrl(module, context)} style={{color: 'rgba(0, 0, 0, 0.54)', textDecoration: 'underline'}}>
        {importPath(module, context)}
      </Link>
    </p>
  )
}

export const DocBlock = styled.div`
  padding-top: 8px;
  padding-left: 24px;
  padding-bottom: 8px;

  pre {
    padding: 12px;
    background-color: ${materialColors['grey-100']};
  }
`

export const CodeBlock = ({language = 'jsx', literal}) =>
  <pre>
    <PrismCode className={`language-${language}`}>{literal}</PrismCode>
  </pre>

export const Markdown = ({style, ...props}: any) =>
  <div style={style || {paddingTop: 8}}>
    <ReactMarkdown
      escapeHtml
      renderers={{CodeBlock} as any}
      {...props}
    />
  </div>

export const Property = ({prop, showOptional, context}: {prop: TypeProperty|DocEntry, showOptional?: boolean, context: Package}) =>
  <div style={{paddingTop: 4, paddingBottom: 4}}>
    <h5>
      <PropertyName>{prop.name}</PropertyName>
      {showOptional && prop['optional'] && '?'}
      {prop.type && <span>: <Type type={prop.type} context={context} /></span>}
    </h5>
    {prop.documentation && <DocBlock>
      <Markdown source={prop.documentation} />
    </DocBlock>}
  </div>

export const EntryLink = ({declaration, module, context}: {declaration: UntaggedDeclaration, module: Module, context: Package}) =>
  <Link to={entryUrl(declaration, module, context)} style={{color: materialColors['indigo-500']}}>
    {declaration.name}
  </Link>

export function importPath(module: Module, context: Package) {
  return module.outPath === context.mainModule
    ? context.name
    : join(context.name, module.outPath).replace(/\.js$/, '')
}

export const ImportAs = ({declaration, context}: {declaration: UntaggedDeclaration, context: Package}) => {
  const module = context.modules[context.declarationModule[declaration.id]]

  if (!module) return <span />

  return (
    <div>
      {declaration.exportedIn.map(e => {
        const module = context.modules[e.path]

        return <ImportDirective name={e.name} path={importPath(module, context)} />
      })}
      <ImportDirective name={declaration.name} path={importPath(module, context)} />
    </div>
  )
}

const ImportDirective = ({name, path}) =>
  <div style={{paddingBottom: 4}}>
    <Keyword>import</Keyword>{' '}
    {'{'}{name}{'}'}{' '}
    <Keyword>from</Keyword>{' '}
    <StringLiteral>'{path}'</StringLiteral>
  </div>
