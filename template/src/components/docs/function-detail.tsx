import {FunctionDeclaration} from 'documittu-analyzer-ts'
import * as React from 'react'
import {ApiDocs} from '../../lib/entities'
import {DocBlock, ImportAs, Markdown} from '../ui/docs'
import {Type, TypeParameters, joined} from '../ui/types'

export const FunctionDetail = ({fn, apiDocs}: {fn: FunctionDeclaration, apiDocs: ApiDocs}) => {
  return (
    <div>
      <h3>{fn.name}</h3>
      <DocBlock>
        <ImportAs declaration={fn} apiDocs={apiDocs} />
        <Markdown source={fn.documentation} />
      </DocBlock>
      <h6>Signature</h6>
      <div>
        {fn.typeParameters && <TypeParameters parameters={fn.typeParameters} apiDocs={apiDocs} />}
        (
        {fn.parameters.map(joined(', ', p => <span>{p.name}: <Type type={p.type} apiDocs={apiDocs} /></span>))}
        ) => <Type type={fn.returnType} apiDocs={apiDocs} />
      </div>
    </div>
  )
}
