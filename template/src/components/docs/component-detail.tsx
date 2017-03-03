import {ComponentDeclaration} from 'documittu-analyzer-ts'
import * as React from 'react'
import {Package} from '../../routes'
import {DocBlock, DocListItem, ImportAs, Markdown, Property} from '../ui/docs'

export const ComponentDetail = ({component, context}: {component: ComponentDeclaration, context: Package}) => {
  const requiredProps = component.properties.filter(p => !p.optional)
  const optionalProps = component.properties.filter(p => p.optional)

  return (
    <DocListItem>
      <h4>{component.name}</h4>
      <DocBlock>
        <ImportAs type={component} context={context} />
        <Markdown source={component.documentation} />
      </DocBlock>
      {requiredProps.length === 0 && optionalProps.length === 0 &&
        <span>This component does not take any properties</span>
      }
      {requiredProps.length > 0 && <h5>Required Properties</h5>}
      {requiredProps.map(prop => <Property key={prop.name} prop={prop} context={context} />)}
      {optionalProps.length > 0 && <h5>Optional Properties</h5>}
      {optionalProps.map(prop => <Property key={prop.name} prop={prop} context={context} />)}
    </DocListItem>
  )
}
