import * as React from 'react'
import {Component} from 'react'

export const A = () => <span />
export const B = ({name}) => <span>{name}</span>
export const C = ({name = 'Hi'}) => <span>{name}</span>
export const D = ({name}: {name: string}) => <span>{name}</span>
export const E = ({name = 'Ho'}: {name: string}) => <span>{name}</span>
export const F = ({name = 'Ho'}: {name?: string}) => <span>{name}</span>
export const G = ({name}: {name?: string}) => <span>{name}</span>

export class H extends Component<any, any> {
  render() {
    return <A />
  }
}

export class I extends Component<{name: string}, any> {
  render() {
    return <A />
  }
}

export class J extends Component<{name?: string}, any> {
  render() {
    return <A />
  }
}
