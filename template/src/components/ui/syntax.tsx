import styled from 'styled-components'
import {materialColors} from 'styled-material/dist/src/colors'

export const Keyword = styled.span`
  color: ${materialColors['purple-700']};
`
export const StringLiteral = styled.span`
  color: ${materialColors['green-700']};
`
export const BooleanLiteral = styled.span`
  color: ${materialColors['purple-700']};
`
export const NumberLiteral = styled.span`
  color: ${materialColors['blue-700']};
`

export const PropertyName = styled.span`
  color: ${materialColors['teal-800']};
  font-weight: 500;
`

export const TypeName = styled.span`
  color: ${materialColors['indigo-600']};
`
