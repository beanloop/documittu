import {TypeBound} from 'documittu-analyzer-ts'
import * as React from 'react'
import {Link} from 'react-router-dom'
import styled from 'styled-components'
import {materialColors} from 'styled-material/dist/src/colors'
import {Package} from '../../routes'

const TypeName = styled.span`
  color: ${materialColors['indigo-600']};
`

const BooleanLiteral = styled.span`
  color: ${materialColors['purple-500']};
`
const NumberLiteral = styled.span`
  color: ${materialColors['blue-500']};
`
const StringLiteral = styled.span`
  color: ${materialColors['green-500']};
`

function joined(delimiter: string, fn) {
  return (e, i) => i === 0
    ? fn(e)
    : <span>{delimiter}{fn(e)}</span>
}

function typeUrl(context: Package, type: {id: any}) {
  return context.modules[context.declarationModule[type.id]].typeUrls[type.id]
}

export const Type = ({type, context}: {type: TypeBound, context: Package}): React.ReactElement<any> => {
  switch (type.kind) {
    case 'Named':
      return (
        <span>
          {context.declarationModule[type.id]
            ? <Link to={typeUrl(context, type)}><TypeName>{type.name}</TypeName></Link>
            : <TypeName>{type.name}</TypeName>
          }
          {type.parameters && <TypeParameters parameters={type.parameters} context={context} />}
        </span>
    )
    case 'Object':
      return (
        <span>
          {'{'}
          {type.properties.map(joined(', ', p => <span>{p.name}: <Type type={p.type} context={context} /></span>))}
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
          {type.parameters.map(joined(', ', p => <span>{p.name}: <Type type={p.type} context={context} /></span>))}
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
      return <BooleanLiteral>{type.value}</BooleanLiteral>
    case 'NumberLiteral':
      return <NumberLiteral>{type.value}</NumberLiteral>
    case 'StringLiteral':
      return <StringLiteral>{`'`}{type.value}{`'`}</StringLiteral>
  }
}

export const TypeParameters = ({parameters, context}: {parameters: Array<TypeBound>, context: Package}) =>
  <span>
    {'<'}
    {parameters.map((p, i) => <Type key={i} type={p} context={context} />)}
    {'>'}
  </span>
