import {Package, VariableDeclaration} from 'documittu-analyzer-ts'
import * as React from 'react'
import {CodeBlock, DocBlock, ImportAs, Markdown} from '../ui/docs'
import {Type} from '../ui/types'

export const VariableDetail = ({variable, context}: {variable: VariableDeclaration, context: Package}) => {
  return (
    <div>
      <h4>{variable.name}</h4>
      <DocBlock>
        <ImportAs declaration={variable} context={context} />
        <Markdown source={variable.documentation} />
      </DocBlock>
      <h6>Type</h6>
      <Type type={variable.type} context={context} />
      <h6>Value</h6>
      <CodeBlock literal={`var ${variable.name} = ${variable.value}`} />
    </div>
  )
}
