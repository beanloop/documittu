import {ClassDeclaration, Package} from 'documittu-analyzer-ts'
import * as React from 'react'
import {DocBlock, ImportAs, Markdown, Property} from '../ui/docs'

export const ClassDetail = ({type, context}: {type: ClassDeclaration, context: Package}) => {
  return (
    <div>
      <h4>{type.name}</h4>
      <DocBlock>
        <ImportAs declaration={type} context={context} />
        <Markdown source={type.documentation} />
      </DocBlock>
      <h5>Properties</h5>
      {type.properties.map(prop => <Property key={prop.name} prop={prop} context={context} />)}
    </div>
  )
}
