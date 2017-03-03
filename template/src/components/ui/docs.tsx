import {Declaration, DocEntry, TypeProperty} from 'documittu-analyzer-ts'
import {join} from 'path'
import * as React from 'react'
import ReactMarkdown from 'react-markdown'
import {PrismCode} from 'react-prism'
import {Link} from 'react-router-dom'
import styled from 'styled-components'
import {materialColors} from 'styled-material/dist/src/colors'
import {Module, ModulePageConfig, Package} from '../../routes'
import {Type} from './types'

export const DocListItem = styled.div`
  h5 {
    margin-top: 1.5em !important;
    margin-bottom: 1em !important;
  }
`

export const DocBlock = styled.div`
  padding-left: 24px;
  padding-bottom: 16px;

  pre {
    padding: 12px;
    background-color: ${materialColors['grey-100']};
  }
`

export const CodeBlock = ({language = 'jsx', literal}) =>
  <pre>
    <PrismCode className={`language-${language}`}>{literal}</PrismCode>
  </pre>

export const Markdown = props =>
  <ReactMarkdown escapeHtml renderers={{CodeBlock} as any} {...props} />

export const PropertyName = styled.span`
  color: ${materialColors['teal-800']};
  font-weight: 500;
`

const Keyword = styled.span`
  color: ${materialColors['purple-500']};
`
const StringLiteral = styled.span`
  color: ${materialColors['green-500']};
`

export const Property = ({prop, showOptional, context}: {prop: TypeProperty, showOptional?: boolean, context: Package}) =>
  <div>
    <h6>
      <PropertyName>{prop.name}</PropertyName>
      {showOptional && prop.optional && '?'}
      {prop.type && <span>: <Type type={prop.type} context={context} /></span>}
    </h6>
    <DocBlock>
      <Markdown source={prop.documentation} />
    </DocBlock>
  </div>

export type EntryType = 'component'|'type'

export function entryUrl(entry: DocEntry, page: ModulePageConfig, type: EntryType) {
  return join(page.url, `${type}.${entry.name}`)
}

export const EntryLink = ({entry, page, type}: {entry: DocEntry, page: ModulePageConfig, type: EntryType}) =>
  <Link to={entryUrl(entry, page, type)} style={{color: materialColors['indigo-500']}}>
    {entry.name}
  </Link>

export function importPath(module: Module, context: Package) {
  return module.outPath === context.mainModule
    ? context.name
    : join(context.name, module.outPath).replace(/\.js$/, '')
}

export const ImportAs = ({type, context}: {type: Declaration, context: Package}) => {
  const module = context.modules[context.declarationModule[type.id]]

  if (!module) return <span />

  return (
    <div>
      <Keyword>import</Keyword>{' '}
      {'{'}{type.name}{'}'}{' '}
      <Keyword>from</Keyword>{' '}
      <StringLiteral>'{importPath(module, context)}'</StringLiteral>
    </div>
  )
}
