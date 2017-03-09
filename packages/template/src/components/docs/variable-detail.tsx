import {VariableDeclaration} from 'documittu-analyzer-ts'
import * as React from 'react'
import {ApiDocs} from '../../lib/entities'
import {CodeBlock, DocBlock, ImportAs, Markdown} from '../ui/docs'
import {Type} from '../ui/types'

export const VariableDetail = ({variable, apiDocs}: {variable: VariableDeclaration, apiDocs: ApiDocs}) => {
  return (
    <div>
      <h3>{variable.name}</h3>
      <DocBlock>
        <ImportAs declaration={variable} apiDocs={apiDocs} />
        <Markdown source={variable.documentation} />
      </DocBlock>
      <h6>Type</h6>
      <Type type={variable.type} apiDocs={apiDocs} />
      <h6>Value</h6>
      <CodeBlock literal={`var ${variable.name} = ${variable.value}`} />
    </div>
  )
}
