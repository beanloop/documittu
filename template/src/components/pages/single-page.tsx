import * as React from 'react'
import DocumentTitle from 'react-document-title'
import {Page} from '../../routes'

export const SinglePage = ({page, appTitle}: {page: Page, appTitle: String}) =>
  <div>
    <DocumentTitle title={`${page.title} - ${appTitle}`} />
    <page.component />
  </div>
