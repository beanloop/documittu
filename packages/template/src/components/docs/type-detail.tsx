import {ObjectTypeBound, TypeDeclaration} from 'documittu-analyzer-ts'
import * as React from 'react'
import {ApiDocs} from '../../lib/entities'
import {DocBlock, ImportAs, Markdown, Property} from '../ui/docs'
import {Type} from '../ui/types'

export const TypeDetail = ({type, apiDocs}: {type: TypeDeclaration, apiDocs: ApiDocs}) => {
  const type_ = type.type
  return (
    <div>
      <h3>{type.name}</h3>
      <DocBlock>
        <ImportAs declaration={type} apiDocs={apiDocs} />
        <Markdown source={type.documentation} />
      </DocBlock>
      {type_.kind === 'Object'
        ? <div>
            <h4>Properties</h4>
            {(type_ as ObjectTypeBound).properties.map(prop =>
              <Property key={prop.name} prop={prop} showOptional apiDocs={apiDocs} />
            )}
          </div>
        : <div>
            <h4>Type</h4>
            {<Type type={type_} apiDocs={apiDocs} />}
          </div>
      }
    </div>
  )
}
