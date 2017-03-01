import * as React from 'react'
import DocumentTitle from 'react-document-title'
import {Link} from 'react-router-dom'
import Redirect from 'react-router/Redirect'
import Route from 'react-router/Route'
import styled from 'styled-components'
import {materialColors} from 'styled-material/dist/src/colors'
import {Row} from 'styled-material/dist/src/layout'
import {FolderPage as FolderPageEntity} from '../routes'
import {mobile} from '../styles'
import {RouterLink} from './router-link'

const Container = styled(Row)`
  @media (${mobile}) {
    flex-direction: column;
  }
`

const Nav = styled.nav`
  flex-shrink: 0;
  box-sizing: border-box;
  width: 190px;
  border-right: 1px solid rgba(0, 0, 0, 0.30);

  @media (${mobile}) {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 8px;
    width: 100%;
    border-right: none;
    border-bottom: 1px solid rgba(0, 0, 0, 0.30);
  }
`

const NavLink: any = styled(Link)`
  display: block;
  margin-bottom: 4px;
  padding-top: 4px;
  padding-left: 4px;
  padding-bottom: 4px;

  color: ${materialColors['indigo-500']};
  border-left: 3px solid transparent;
  font-weight: ${({active}: any) => active ? 500 : 400};

  text-decoration: none;

  &:focus:not(:active) {
    border-left: 3px solid ${materialColors['pink-a400']};
    outline: none;
  }
`

const Content = styled.section`
  padding-left: 16px;
`

export const FolderPage = ({page, appTitle}: {page: FolderPageEntity, appTitle: String}) =>
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
