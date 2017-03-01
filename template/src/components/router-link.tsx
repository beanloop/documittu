import * as React from 'react'
import Route from 'react-router/Route'

export const RouterLink = ({component: Link = 'a', to, exact = false, children = null}) =>
  <Route exact={exact} path={to} children={({match}) =>
    <Link to={to} active={match} onKeyPress={e => e.key === ' ' && e.target.click()}>
      {children}
    </Link>
  } />
