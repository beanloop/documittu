import {Package, TypeBound} from 'documittu-analyzer-ts'
import * as React from 'react'
import {Link} from 'react-router-dom'
import {entryUrl} from '../../lib/urls'
import {importPath} from './docs'
import {Keyword, NumberLiteral, StringLiteral, TypeName} from './syntax'

export function joined(delimiter: string, fn) {
  return (e, i) => i === 0
    ? React.cloneElement(fn(e), {key: i})
    : <span key={i}>{delimiter}{fn(e)}</span>
}

function typeUrl(context: Package, type: {id?: any}) {
  const id = context.typeDeclaration[type.id]
  const modulePath = context.declarationModule[id]
  const module = context.modules[modulePath]
  const declaration = module && module.declarations[id]

  return declaration && entryUrl(declaration, module, context)
}

function typeImportPath(context: Package, type: {id?: any}) {
  const id = context.typeDeclaration[type.id]
  const modulePath = context.declarationModule[id]
  const module = context.modules[modulePath]

  return module && importPath(module, context)
}

export const Type = ({type, context}: {type: TypeBound, context: Package}): React.ReactElement<any> => {
  switch (type.kind) {
    case 'Named':
      return (
        <span>
          {typeUrl(context, type)
            ? <Link
                to={typeUrl(context, type)}
                title={`from ${typeImportPath(context, type)}`}
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
          {type.parameters && <TypeParameters parameters={type.parameters} context={context} />}
        </span>
    )
    case 'Object':
      return (
        <span>
          {'{'}
          {type.properties.map(joined(', ', p => <span>{p.name}: <Type type={p.type} context={context} /></span>))}
          {type.index && <span>{type.properties.length > 0 && ', '}
            {'['}{type.index.name}: <TypeName>string</TypeName>{']: '}
            <Type type={type.index.type} context={context} />
          </span>}
          {'}'}
        </span>
    )
    case 'Tuple':
      return (
        <span>
          {'['}
          {type.properties.map(joined(', ', p => <Type type={p} context={context} />))}
          {']'}
        </span>
    )
    case 'Function':
      return (
        <span>
          {type.typeParameters && <TypeParameters parameters={type.typeParameters} context={context} />}
          (
          {type.parameters.map(joined(', ', p =>
            <span>{p.name}: <Type type={p.type} context={context} /></span>
          ))}
          ) => <Type type={type.returnType} context={context} />
        </span>
    )
    case 'Union':
      return (
        <span>
          {type.types.map(joined(' | ', t => <Type type={t} context={context} />))}
        </span>
    )
    case 'Intersection':
      return (
        <span>
          {type.types.map(joined(' & ', t => <Type type={t} context={context} />))}
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

export const TypeParameters = ({parameters, context}: {parameters: Array<TypeBound>, context: Package}) =>
  <span>
    {'<'}
    {parameters.map(joined(', ', p => <Type type={p} context={context} />))}
    {'>'}
  </span>
