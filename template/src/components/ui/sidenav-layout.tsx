import {Link} from 'react-router-dom'
import styled from 'styled-components'
import {materialColors} from 'styled-material/dist/src/colors'
import {Row} from 'styled-material/dist/src/layout'
import {mobile} from '../../styles'

export const Container = styled(Row)`
  @media (${mobile}) {
    flex-direction: column;
  }
`

export const Nav = styled.nav`
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

  > div > h3 {
    font-size: 16px;
    line-height: 1.3;
  }
`

export const NavLink: any = styled(Link)`
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

export const Content = styled.section`
  padding-left: 16px;
`
