import {DocEntry, Module, Reexport, TypeProperty, UntaggedDeclaration} from 'documittu-analyzer-ts'
import {join} from 'path'
import * as React from 'react'
import ReactMarkdown from 'react-markdown'
import {PrismCode} from 'react-prism'
import {Link} from 'react-router-dom'
import styled from 'styled-components'
import {materialColors} from 'styled-material/dist/src/colors'
import {ApiDocs} from '../../lib/entities'
import {entryUrl, moduleUrl} from '../../lib/urls'
import {Keyword, PropertyName, StringLiteral} from './syntax'
import {Type} from './types'

export const DocListItem = ({item, apiDocs, children}: {item: {reexport?: Reexport}, apiDocs: ApiDocs, children?: any}) =>
  <div>
    {children}
    {item.reexport && <Reexported reexport={item.reexport} apiDocs={apiDocs} />}
  </div>

export const Reexported = ({reexport, apiDocs}: {reexport: Reexport, apiDocs: ApiDocs}) => {
  const module = apiDocs.data.modules[reexport.path]
  if (!module) return <span />

  return (
    <p style={{color: 'rgba(0, 0, 0, 0.54)'}}>
      Exported from{' '}
      <Link to={moduleUrl(module, apiDocs)} style={{color: 'rgba(0, 0, 0, 0.54)', textDecoration: 'underline'}}>
        {importPath(module, apiDocs)}
      </Link>
    </p>
  )
}

export const DocBlock = styled.div`
  padding-top: 8px;
  padding-left: 24px;
  padding-bottom: 8px;
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

export const Property = ({prop, showOptional, apiDocs}: {prop: TypeProperty|DocEntry, showOptional?: boolean, apiDocs: ApiDocs}) =>
  <div style={{paddingTop: 4, paddingBottom: 4}}>
    <h5>
      <PropertyName>{prop.name}</PropertyName>
      {showOptional && prop['optional'] && '?'}
      {prop.type && <span>: <Type type={prop.type} apiDocs={apiDocs} /></span>}
    </h5>
    {prop.documentation && <DocBlock>
      <Markdown source={prop.documentation} />
    </DocBlock>}
  </div>

export const EntryLink = ({declaration, module, apiDocs}: {declaration: UntaggedDeclaration, module: Module, apiDocs: ApiDocs}) =>
  <Link to={entryUrl(declaration, module, apiDocs)} style={{color: materialColors['indigo-500']}}>
    {declaration.name}
  </Link>

export function importPath(module: Module, apiDocs: ApiDocs) {
  return module.outPath === apiDocs.data.mainModule
    ? apiDocs.data.name
    : join(apiDocs.data.name, module.outPath).replace(/(?:\/index)?\.js$/, '')
}

export const ImportAs = ({declaration, apiDocs}: {declaration: UntaggedDeclaration, apiDocs: ApiDocs}) => {
  const module = apiDocs.data.modules[apiDocs.data.declarationModule[declaration.id]]

  if (!module) return <span />

  return (
    <div>
      {declaration.exportedIn.map((e, i) => {
        const module = apiDocs.data.modules[e.path]

        return <ImportDirective key={i} name={e.name} path={importPath(module, apiDocs)} />
      })}
      <ImportDirective name={declaration.name} path={importPath(module, apiDocs)} />
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
