import {join} from 'path'
import * as React from 'react'
import DocumentTitle from 'react-document-title'
import {Link} from 'react-router-dom'
import Route from 'react-router/Route'
import Switch from 'react-router/Switch'
import styled from 'styled-components'
import {materialColors} from 'styled-material/dist/src/colors'
import {Column} from 'styled-material/dist/src/layout'
import {ModulePageConfig} from '../../lib/entities'
import {entryUrl} from '../../lib/urls'
import {ClassDetail} from '../docs/class-detail'
import {ComponentDetail} from '../docs/component-detail'
import {FunctionDetail} from '../docs/function-detail'
import {ModuleDetail} from '../docs/module-detail'
import {TypeDetail} from '../docs/type-detail'
import {VariableDetail} from '../docs/variable-detail'
import {RouterLink} from '../router-link'
import {Container, Content, Nav, NavLink} from '../ui/sidenav-layout'

const PathLink: any = styled(Link)`
  padding: 4px;

  color: ${materialColors['indigo-500']};
  border-bottom: 3px solid transparent;
  font-weight: ${({active}: any) => active ? 500 : 400};

  text-decoration: none;

  &:focus:not(:active) {
    border-bottom: 3px solid ${materialColors['pink-a400']};
    outline: none;
  }
`

const PathBar = styled.div`
  padding-bottom: 8px;
`

const NavBlock = styled.div`
  overflow: hidden;

  a {
    text-overflow: ellipsis;
  }
`

export const ModulePage = ({page, appTitle, path}: {page: ModulePageConfig, appTitle: String, path: Array<ModulePageConfig>}) =>
  <Column>
    <DocumentTitle title={`Module - ${appTitle}`} />
    <PathBar>
      {path.map((part, i) =>
        <span key={i}>
          {i > 0 && ' / '}
          <RouterLink key={part.url} component={PathLink} exact to={part.url}>
            {part.title}
          </RouterLink>
        </span>
      )}
    </PathBar>
    <Container>
      <Nav>
        {page.modules.length > 0 &&
          <NavBlock>
            <h3>Modules</h3>
            {page.modules.map(module =>
              <RouterLink
                key={module.url}
                component={NavLink}
                exact
                to={module.url}
              >
                {module.title}
              </RouterLink>
            )}
          </NavBlock>
        }
        {page.components.length > 0 &&
          <NavBlock>
            <h3>Components</h3>
            {page.components.map(component =>
              <RouterLink
                key={component.name}
                component={NavLink}
                exact
                to={entryUrl(component, page.module, page.apiData)}
              >
                {component.name}
              </RouterLink>
            )}
          </NavBlock>
        }
        {page.types.length > 0 &&
          <NavBlock>
            <h3>Types</h3>
            {page.types.map(type =>
              <RouterLink
                key={type.name}
                component={NavLink}
                exact
                to={entryUrl(type, page.module, page.apiData)}
              >
                {type.name}
              </RouterLink>
            )}
          </NavBlock>
        }
        {page.classes.length > 0 &&
          <NavBlock>
            <h3>Classes</h3>
            {page.classes.map(type =>
              <RouterLink
                key={type.name}
                component={NavLink}
                exact
                to={entryUrl(type, page.module, page.apiData)}
              >
                {type.name}
              </RouterLink>
            )}
          </NavBlock>
        }
        {page.functions.length > 0 &&
          <NavBlock>
            <h3>Functions</h3>
            {page.functions.map(fn =>
              <RouterLink
                key={fn.name}
                component={NavLink}
                exact
                to={entryUrl(fn, page.module, page.apiData)}
              >
                {fn.name}
              </RouterLink>
            )}
          </NavBlock>
        }
        {page.variables.length > 0 &&
          <NavBlock>
            <h3>Variables</h3>
            {page.variables.map(variable =>
              <RouterLink
                key={variable.name}
                component={NavLink}
                exact
                to={entryUrl(variable, page.module, page.apiData)}
              >
                {variable.name}
              </RouterLink>
            )}
          </NavBlock>
        }
      </Nav>
      <Content>
        {page.components.map(component =>
          <Route exact key={component.name} path={entryUrl(component, page.module, page.apiData)} render={() =>
            <ComponentDetail component={component} context={page.apiData} />
          } />
        )}
        {page.types.map(type =>
          <Route exact key={type.name} path={entryUrl(type, page.module, page.apiData)} render={() =>
            <TypeDetail type={type} context={page.apiData} />
          } />
        )}
        {page.classes.map(type =>
          <Route exact key={type.name} path={entryUrl(type, page.module, page.apiData)} render={() =>
            <ClassDetail type={type} context={page.apiData} />
          } />
        )}
        {page.functions.map(fn =>
          <Route exact key={fn.name} path={entryUrl(fn, page.module, page.apiData)} render={() =>
            <FunctionDetail fn={fn} context={page.apiData} />
          } />
        )}
        {page.variables.map(variable =>
          <Route exact key={variable.name} path={entryUrl(variable, page.module, page.apiData)} render={() =>
            <VariableDetail variable={variable} context={page.apiData} />
          } />
        )}
        <Route exact path={page.url} render={() =>
          <ModuleDetail module={page.module} page={page} />
        } />
      </Content>
    </Container>
  </Column>

export const ModuleRoutes = ({page, appTitle, parent}: {page: ModulePageConfig, appTitle: String, parent?: Array<ModulePageConfig>}) =>
  <Switch>
    {page.modules.map(module =>
      <Route key={module.url} path={module.url} render={() =>
        <ModuleRoutes
          page={module}
          appTitle={appTitle}
          parent={parent ? [...parent, page] : [page]}
        />
      } />
    )}
    <Route exact path={join(page.url, `([a-z]+\.[A-Za-z0-9_]+)?`)} render={() =>
      <ModulePage page={page} appTitle={appTitle} path={parent ? [...parent, page] : [page]} />
    } />
  </Switch>
