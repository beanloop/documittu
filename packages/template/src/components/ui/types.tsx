import {TypeBound} from 'documittu-analyzer-ts'
import * as React from 'react'
import {Link} from 'react-router-dom'
import {ApiDocs} from '../../lib/entities'
import {entryUrl} from '../../lib/urls'
import {importPath} from './docs'
import {Keyword, NumberLiteral, StringLiteral, TypeName} from './syntax'

export function joined(delimiter: string, fn) {
  return (e, i) => i === 0
    ? React.cloneElement(fn(e), {key: i})
    : <span key={i}>{delimiter}{fn(e)}</span>
}

function typeUrl(apiDocs: ApiDocs, type: {id?: any}) {
  const id = apiDocs.data.typeDeclaration[type.id]
  const modulePath = apiDocs.data.declarationModule[id]
  const module = apiDocs.data.modules[modulePath]
  const declaration = module && module.declarations[id]

  return declaration && entryUrl(declaration, module, apiDocs)
}

function typeImportPath(apiDocs: ApiDocs, type: {id?: any}) {
  const id = apiDocs.data.typeDeclaration[type.id]
  const modulePath = apiDocs.data.declarationModule[id]
  const module = apiDocs.data.modules[modulePath]

  return module && importPath(module, apiDocs)
}

export const Type = ({type, apiDocs}: {type: TypeBound, apiDocs: ApiDocs}): React.ReactElement<any> => {
  switch (type.kind) {
    case 'Named':
      return (
        <span>
          {typeUrl(apiDocs, type)
            ? <Link
                to={typeUrl(apiDocs, type)}
                title={`from ${typeImportPath(apiDocs, type)}`}
              >
                <TypeName>{type.name}</TypeName>
              </Link>
            : <TypeName
                title={type.importedFrom && `from ${type.importedFrom}`}
                style={{cursor: 'default'}}
              >
                {type.name}
              </TypeName>
          }
          {type.parameters && <TypeParameters parameters={type.parameters} apiDocs={apiDocs} />}
        </span>
    )
    case 'Object':
      return (
        <span>
          {'{'}
          {type.properties.map(joined(', ', p => <span>{p.name}: <Type type={p.type} apiDocs={apiDocs} /></span>))}
          {type.index && <span>{type.properties.length > 0 && ', '}
            {'['}{type.index.name}: <TypeName>string</TypeName>{']: '}
            <Type type={type.index.type} apiDocs={apiDocs} />
          </span>}
          {'}'}
        </span>
    )
    case 'Tuple':
      return (
        <span>
          {'['}
          {type.properties.map(joined(', ', p => <Type type={p} apiDocs={apiDocs} />))}
          {']'}
        </span>
    )
    case 'Function':
      return (
        <span>
          {type.typeParameters && <TypeParameters parameters={type.typeParameters} apiDocs={apiDocs} />}
          (
          {type.parameters.map(joined(', ', p =>
            <span>{p.name}: <Type type={p.type} apiDocs={apiDocs} /></span>
          ))}
          ) => <Type type={type.returnType} apiDocs={apiDocs} />
        </span>
    )
    case 'Union':
      return (
        <span>
          {type.types.map(joined(' | ', t => <Type type={t} apiDocs={apiDocs} />))}
        </span>
    )
    case 'Intersection':
      return (
        <span>
          {type.types.map(joined(' & ', t => <Type type={t} apiDocs={apiDocs} />))}
        </span>
    )
    case 'BooleanLiteral':
      return <Keyword>{type.value}</Keyword>
    case 'NumberLiteral':
      return <NumberLiteral>{type.value}</NumberLiteral>
    case 'StringLiteral':
      return <StringLiteral>{`'`}{type.value}{`'`}</StringLiteral>
  }
}

export const TypeParameters = ({parameters, apiDocs}: {parameters: Array<TypeBound>, apiDocs: ApiDocs}) =>
  <span>
    {'<'}
    {parameters.map(joined(', ', p => <Type type={p} apiDocs={apiDocs} />))}
    {'>'}
  </span>
