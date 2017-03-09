import {join, relative} from 'path'
import {Package, analyze} from '../index'

const root = relative(process.cwd(), __dirname)

function createResult(): Package {
  return {
    name: 'cases',
    mainModule: undefined,
    outDir: join(root, 'cases-out'),
    typeDeclaration: {},
    declarationModule: {},
    modules: {},
    readmes: {},
  }
}

function cases(files: Array<string>): Package {
  const result = createResult()
  analyze(files.map(f => join(root, 'cases', f)), result, join(root, 'cases'))
  return result
}

describe('analyze', () => {
  describe('cases', () => {
    it('should emit boolean as boolean', () => {
      expect(cases(['booleans.ts'])).toMatchSnapshot()
    })

    it('should emit components', () => {
      expect(cases(['components.tsx'])).toMatchSnapshot()
    })
  })
})
