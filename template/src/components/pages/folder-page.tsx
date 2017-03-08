import * as React from 'react'
import DocumentTitle from 'react-document-title'
import Redirect from 'react-router/Redirect'
import Route from 'react-router/Route'
import {FolderPageConfig} from '../../lib/entities'
import {RouterLink} from '../router-link'
import {Container, Content, Nav, NavLink} from '../ui/sidenav-layout'

export const FolderPage = ({page, appTitle}: {page: FolderPageConfig, appTitle: String}) =>
  <Container>
    {page.redirectTo &&
      <Route exact path={page.url} render={() =>
        <Redirect to={page.redirectTo} />
      } />
    }
    <Nav>
      {page.subPages.map(({url, title}) =>
        <RouterLink key={url} component={NavLink} exact to={url}>
          {title}
        </RouterLink>
      )}
    </Nav>
    <Content>
      {page.subPages.map(subRoute =>
        <Route exact key={subRoute.url} path={subRoute.url} render={() =>
          <div>
            <DocumentTitle title={`${subRoute.title} - ${page.title} - ${appTitle}`} />
            <subRoute.component />
          </div>
        } />
      )}
    </Content>
  </Container>
