import {ClassDeclaration} from 'documittu-analyzer-ts'
import * as React from 'react'
import {ApiDocs} from '../../lib/entities'
import {DocBlock, ImportAs, Markdown, Property} from '../ui/docs'

export const ClassDetail = ({type, apiDocs}: {type: ClassDeclaration, apiDocs: ApiDocs}) => {
  return (
    <div>
      <h3>{type.name}</h3>
      <DocBlock>
        <ImportAs declaration={type} apiDocs={apiDocs} />
        <Markdown source={type.documentation} />
      </DocBlock>
      <h4>Properties</h4>
      {type.properties.map(prop => <Property key={prop.name} prop={prop} apiDocs={apiDocs} />)}
    </div>
  )
}
