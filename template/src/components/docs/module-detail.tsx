import {
  ClassDeclaration,
  ComponentDeclaration,
  FunctionDeclaration,
  Module,
  TypeDeclaration,
  VariableDeclaration,
} from 'documittu-analyzer-ts'
import {basename, dirname} from 'path'
import * as React from 'react'
import {Link} from 'react-router-dom'
import {ModulePageConfig} from '../../routes'
import {DocBlock, DocListItem, EntryLink, Markdown} from '../ui/docs'
import {Type, TypeParameters, joined} from '../ui/types'

export const ModuleDetail = ({module, page}: {module: Module, page: ModulePageConfig}) =>
  <div>
    <h2>{page.title}</h2>
    {basename(module.outPath) === 'index.js' && page.apiData.readmes[dirname(module.outPath)] &&
      <Markdown source={page.apiData.readmes[dirname(module.outPath)]} />
    }

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
    {module.classes.length > 0 &&
      <div>
        <h3>Classes</h3>
        {module.classes.map(type =>
          <ClassListItem key={type.name} type={type} page={page} />
        )}
      </div>
    }
    {module.functions.length > 0 &&
      <div>
        <h3>Functions</h3>
        {module.functions.map(fn =>
          <FunctionListItem key={fn.name} fn={fn} page={page} />
        )}
      </div>
    }
    {module.variables.length > 0 &&
      <div>
        <h3>Variables</h3>
        {module.variables.map(variable =>
          <VariableListItem key={variable.name} variable={variable} page={page} />
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

const ClassListItem = ({type, page}: {type: ClassDeclaration, page: ModulePageConfig}) => {
  return (
    <DocListItem>
      <h4>
        <EntryLink page={page} entry={type} type='class' />
      </h4>
      <LeadDocumentation source={type.documentation} />
    </DocListItem>
  )
}

const FunctionListItem = ({fn, page}: {fn: FunctionDeclaration, page: ModulePageConfig}) => {
  return (
    <DocListItem>
      <h4>
        <EntryLink page={page} entry={fn} type='function' />
        {fn.typeParameters && <TypeParameters parameters={fn.typeParameters} context={page.apiData} />}
        (
        {fn.parameters.map(joined(', ', p => <span>{p.name}: <Type type={p.type} context={page.apiData} /></span>))}
        ) => <Type type={fn.returnType} context={page.apiData} />
      </h4>
      <LeadDocumentation source={fn.documentation} />
    </DocListItem>
  )
}

const VariableListItem = ({variable, page}: {variable: VariableDeclaration, page: ModulePageConfig}) => {
  return (
    <DocListItem>
      <h4>
        <EntryLink page={page} entry={variable} type='variable' />
      </h4>
      <LeadDocumentation source={variable.documentation} />
    </DocListItem>
  )
}

const LeadDocumentation = ({source}) =>
  source
    ? <DocBlock>
        <Markdown source={source.split('\n\n')[0]} style={{padding:  0}} />
      </DocBlock>
    : <span />
