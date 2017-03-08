import {FunctionDeclaration, Package} from 'documittu-analyzer-ts'
import * as React from 'react'
import {DocBlock, ImportAs, Markdown} from '../ui/docs'
import {Type, TypeParameters, joined} from '../ui/types'

export const FunctionDetail = ({fn, context}: {fn: FunctionDeclaration, context: Package}) => {
  return (
    <div>
      <h4>{fn.name}</h4>
      <DocBlock>
        <ImportAs declaration={fn} context={context} />
        <Markdown source={fn.documentation} />
      </DocBlock>
      <h5>
        {fn.typeParameters && <TypeParameters parameters={fn.typeParameters} context={context} />}
        (
        {fn.parameters.map(joined(', ', p => <span>{p.name}: <Type type={p.type} context={context} /></span>))}
        ) => <Type type={fn.returnType} context={context} />
      </h5>
    </div>
  )
}
