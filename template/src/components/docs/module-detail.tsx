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
import styled from 'styled-components'
import {Row} from 'styled-material/dist/src/layout'
import {Body} from 'styled-material/dist/src/typography'
import {ModulePageConfig} from '../../lib/entities'
import {DocBlock, DocListItem, EntryLink, Markdown} from '../ui/docs'
import {Type, TypeParameters, joined} from '../ui/types'

export const ModuleDetail = ({module, page}: {module: Module, page: ModulePageConfig}) =>
  <div>
    {basename(module.outPath) === 'index.js' && page.apiData.readmes[dirname(module.outPath)]
      ? <Markdown source={page.apiData.readmes[dirname(module.outPath)]} />
      : <h2>{page.title}</h2>
    }

    {page.modules.length > 0 &&
      <div>
        <h3>Modules</h3>
        {page.modules.map(module =>
          <ModuleListItem key={module.url} page={module} />
        )}
      </div>
    }
    {page.components.length > 0 &&
      <div>
        <h3>Components</h3>
        {page.components.map(component =>
          <ComponentListItem key={component.name} component={component} page={page} />
        )}
      </div>
    }
    {page.types.length > 0 &&
      <div>
        <h3>Types</h3>
        {page.types.map(type =>
          <TypeListItem key={type.name} type={type} page={page} />
        )}
      </div>
    }
    {page.classes.length > 0 &&
      <div>
        <h3>Classes</h3>
        {page.classes.map(type =>
          <ClassListItem key={type.name} type={type} page={page} />
        )}
      </div>
    }
    {page.functions.length > 0 &&
      <div>
        <h3>Functions</h3>
        {page.functions.map(fn =>
          <FunctionListItem key={fn.name} fn={fn} page={page} />
        )}
      </div>
    }
    {page.variables.length > 0 &&
      <div>
        <h3>Variables</h3>
        {page.variables.map(variable =>
          <VariableListItem key={variable.name} variable={variable} page={page} />
        )}
      </div>
    }
  </div>

const ModuleListItem = ({page}: {page: ModulePageConfig}) => {
  return (
    <div>
      <h4>
        <Link to={page.url}>{page.title}</Link>
      </h4>
      <LeadDocumentation source={page.documentation} />
    </div>
  )
}

const ComponentListItem = ({component, page}: {component: ComponentDeclaration, page: ModulePageConfig}) => {
  return (
    <DocListItem item={component} context={page.apiData}>
      <h4>
        {'<'}
        <EntryLink declaration={component} module={page.module} context={page.apiData} />
        {'>'}
      </h4>
      <LeadDocumentation source={component.documentation} />
    </DocListItem>
  )
}

const TypeListItem = ({type, page}: {type: TypeDeclaration, page: ModulePageConfig}) => {
  return (
    <DocListItem item={type} context={page.apiData}>
      <h4>
        <EntryLink declaration={type} module={page.module} context={page.apiData} />
      </h4>
      <LeadDocumentation source={type.documentation} />
    </DocListItem>
  )
}

const ClassListItem = ({type, page}: {type: ClassDeclaration, page: ModulePageConfig}) => {
  return (
    <DocListItem item={type} context={page.apiData}>
      <h4>
        <EntryLink declaration={type} module={page.module} context={page.apiData} />
      </h4>
      <LeadDocumentation source={type.documentation} />
    </DocListItem>
  )
}

const FunctionListItem = ({fn, page}: {fn: FunctionDeclaration, page: ModulePageConfig}) => {
  return (
    <DocListItem item={fn} context={page.apiData}>
      <Row vertical='baseline'>
        <h4>
          <EntryLink declaration={fn} module={page.module} context={page.apiData} />
        </h4>
        <InfoLine>
          <span>:&emsp;</span>
          <code>
            {fn.typeParameters && <TypeParameters parameters={fn.typeParameters} context={page.apiData} />}
            (
            {fn.parameters.map(joined(', ', p => <span>{p.name}: <Type type={p.type} context={page.apiData} /></span>))}
            ) => <Type type={fn.returnType} context={page.apiData} />
          </code>
        </InfoLine>
      </Row>
      <LeadDocumentation source={fn.documentation} />
    </DocListItem>
  )
}

const VariableListItem = ({variable, page}: {variable: VariableDeclaration, page: ModulePageConfig}) => {
  return (
    <DocListItem item={variable} context={page.apiData}>
      <Row vertical='baseline'>
        <h4>
          <EntryLink declaration={variable} module={page.module} context={page.apiData} />
        </h4>
        <InfoLine>
          <span>:&emsp;</span>
          <code>
            <Type type={variable.type} context={page.apiData} />
          </code>
        </InfoLine>
      </Row>
      <LeadDocumentation source={variable.documentation} />
    </DocListItem>
  )
}

const LeadDocumentation = ({source}) =>
  source
    ? <DocBlock style={{paddingTop: 0, paddingBottom: 0}}>
        <Markdown source={source.split('\n\n')[0]} style={{padding: 0}} />
      </DocBlock>
    : <span />

const InfoLine = styled(Body)`
  overflow: hidden !important;
  white-space: nowrap;
  text-overflow: ellipsis;
`
