import {ComponentDeclaration, Module, TypeDeclaration} from 'documittu-analyzer-ts'
import * as React from 'react'
import {Link} from 'react-router-dom'
import {ModulePageConfig} from '../../routes'
import {DocBlock, DocListItem, EntryLink, Markdown} from '../ui/docs'

export const ModuleDetail = ({module, page}: {module: Module, page: ModulePageConfig}) =>
  <div>
    {page.modules.length > 0 &&
      <div>
        <h3>Modules</h3>
        {page.modules.map(module =>
          <ModuleListItem key={module.url} page={module} />
        )}
      </div>
    }
    {module.components.length > 0 &&
      <div>
        <h3>Components</h3>
        {module.components.map(component =>
          <ComponentListItem key={component.name} component={component} page={page} />
        )}
      </div>
    }
    {module.types.length > 0 &&
      <div>
        <h3>Types</h3>
        {module.types.map(type =>
          <TypeListItem key={type.name} type={type} page={page} />
        )}
      </div>
    }
  </div>

const ModuleListItem = ({page}: {page: ModulePageConfig}) => {
  return (
    <DocListItem>
      <h4>
        <Link to={page.url}>{page.title}</Link>
      </h4>
      <LeadDocumentation source={page.documentation} />
    </DocListItem>
  )
}

const ComponentListItem = ({component, page}: {component: ComponentDeclaration, page: ModulePageConfig}) => {
  return (
    <DocListItem>
      <h4>
        {'<'}
        <EntryLink page={page} entry={component} type='component' />
        {'>'}
      </h4>
      <LeadDocumentation source={component.documentation} />
    </DocListItem>
  )
}

const TypeListItem = ({type, page}: {type: TypeDeclaration, page: ModulePageConfig}) => {
  return (
    <DocListItem>
      <h4>
        <EntryLink page={page} entry={type} type='type' />
      </h4>
      <LeadDocumentation source={type.documentation} />
    </DocListItem>
  )
}

const LeadDocumentation = ({source}) =>
  source
    ? <DocBlock>
        <Markdown source={source.split('\n\n')[0]} />
      </DocBlock>
    : <span />
