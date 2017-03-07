import {ComponentDeclaration} from 'documittu-analyzer-ts'
import * as React from 'react'
import {Package} from '../../routes'
import {DocBlock, ImportAs, Markdown, Property} from '../ui/docs'

export const ComponentDetail = ({component, context}: {component: ComponentDeclaration, context: Package}) => {
  const requiredProps = component.properties.filter(p => !p.optional)
  const optionalProps = component.properties.filter(p => p.optional)

  return (
    <div>
      <h3>{component.name}</h3>
      <DocBlock>
        <ImportAs type={component} context={context} />
        <Markdown source={component.documentation} />
      </DocBlock>
      {requiredProps.length === 0 && optionalProps.length === 0 &&
        <span>This component does not take any properties</span>
      }
      {requiredProps.length > 0 && <h4>Required Properties</h4>}
      {requiredProps.map(prop => <Property key={prop.name} prop={prop} context={context} />)}
      {optionalProps.length > 0 && <h4>Optional Properties</h4>}
      {optionalProps.map(prop => <Property key={prop.name} prop={prop} context={context} />)}
    </div>
  )
}
