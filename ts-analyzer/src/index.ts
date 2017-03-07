import * as fs from 'fs'
import * as glob from 'glob'
import {dirname, join, normalize, relative} from 'path'
import * as ts from 'typescript'

export type Package = {
  name: string
  outDir: string
  mainModule?: string
  declarationModule: {[typeId: string]: /** path */ string}
  modules: {[path: string]: Module}
  readmes: {[path: string]: string}
}

export type Module = {
  srcPath: string
  outPath: string
  types: Array<TypeDeclaration>
  components: Array<ComponentDeclaration>
  classes: Array<ClassDeclaration>
  functions: Array<FunctionDeclaration>
  variables: Array<VariableDeclaration>
}

export type DocEntry = {
  name?: string
  documentation?: string
  type?: TypeBound
}

export type FunctionDocEntry = DocEntry & {
  name: string
  typeParameters?: Array<TypeBound>
  parameters: Array<TypeProperty>
  returnType: TypeBound
}

export type Declaration = DocEntry & {
  name: string
  id: string
}

export type TypeDeclaration = Declaration & {
  parameters?: Array<TypeBound>
  properties: Array<TypeProperty>
}

export type TypeProperty = DocEntry & {
  optional: boolean
  defaultValue?: string
}

export type ComponentDeclaration = Declaration & {
  properties: Array<TypeProperty>
}

export type ClassDeclaration = Declaration & {
  properties: Array<DocEntry>
  constructors: Array<{parameters: Array<TypeProperty>} & DocEntry>
  methods: Array<FunctionDocEntry>
}

export type FunctionDeclaration = Declaration & FunctionDocEntry

export type VariableDeclaration = Declaration & {
  type: TypeBound
  value: string
}

export type TypeBound
  = {kind: 'Named', name: string, parameters?: Array<TypeBound>, id: any}
  | {kind: 'Object', properties: Array<{name: string, type: TypeBound}>, index?: {name: string, type: TypeBound}}
  | {kind: 'Tuple', properties: Array<TypeBound>}
  | {kind: 'Function', typeParameters?: Array<TypeBound>, parameters: Array<{name: string, type: TypeBound}>, returnType: TypeBound}
  | {kind: 'Intersection', types: Array<TypeBound>}
  | {kind: 'Union', types: Array<TypeBound>}
  | {kind: 'BooleanLiteral', value: string}
  | {kind: 'NumberLiteral', value: string}
  | {kind: 'StringLiteral', value: string}

export function analyze(fileNames: Array<string>, analyzeResult: Package, packagePath: string, options: ts.CompilerOptions = {
  jsx: ts.JsxEmit.Preserve,
  target: ts.ScriptTarget.ES2017,
  module: ts.ModuleKind.CommonJS,
}) {
  let program = ts.createProgram(fileNames, options)
  let checker = program.getTypeChecker()

  function outputPath(srcPath: string) {
    const relativeSrcPath = relative(packagePath, srcPath)
    const outPath = join(analyzeResult.outDir, relativeSrcPath)
      .replace(/\.[jt]sx?$/, '.js')
    return outPath
  }

  for (const sourceFile of program.getSourceFiles()) {
    if (!fileNames.includes(sourceFile.fileName)) {
      continue
    const relativeSrcPath = relative(packagePath, srcPath)
    const outPath = join(analyzeResult.outDir, relativeSrcPath)
      .replace(/\.[jt]sx?$/, '.js')
    return outPath
    }
    const srcPath = relative(packagePath, sourceFile.fileName)
    const outPath = outputPath(sourceFile.fileName)
    analyzeResult.modules[outPath] = {
      srcPath,
      outPath,
      types: [],
      components: [],
      classes: [],
      functions: [],
      variables: [],
    }

    ts.forEachChild(sourceFile, visit)
  }

  return analyzeResult

  function visit(node: ts.Node) {
    // Only consider exported nodes
    if (!isNodeExported(node)) {
      return
    }

    const outPath = outputPath(node.getSourceFile().fileName)
    const module = analyzeResult.modules[outPath]

    if (node.kind === ts.SyntaxKind.TypeAliasDeclaration) {
      const symbol = checker.getSymbolAtLocation((<ts.TypeAliasDeclaration>node).name)
      const type = checker.getDeclaredTypeOfSymbol(symbol)
      analyzeResult.declarationModule[type['id']] = outPath
      module.types.push(serializeTypeDeclaration(symbol))
    }
    else if (node.kind === ts.SyntaxKind.InterfaceDeclaration) {
      const symbol = checker.getSymbolAtLocation((<ts.InterfaceDeclaration>node).name)
      const type = checker.getTypeOfSymbolAtLocation(symbol, node)
      analyzeResult.declarationModule[type['id']] = outPath
      module.types.push(serializeTypeDeclaration(symbol))
    }
    else if (node.kind === ts.SyntaxKind.ClassDeclaration) {
      const name = (<ts.ClassDeclaration>node).name
      if (!name) return
      const symbol = checker.getSymbolAtLocation(name)
      if (!symbol.valueDeclaration) return
      const type = checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration)
      const properties = getPropsType(type)

      analyzeResult.declarationModule[type['id']] = outPath
      if (properties) {
        module.components.push({
          id: type['id'],
          name: name.text,
          documentation: getDocs(symbol),
          properties,
        })
      }
      // It's not a component
      else {
        module.classes.push({
          id: type['id'],
          name: name.text,
          documentation: getDocs(symbol),
          ...serializeClass(type)
        })
      }
    }
    else if (node.kind === ts.SyntaxKind.FunctionDeclaration) {
      const fn = node as ts.FunctionDeclaration
      if (!fn.name) return
      if (!fn.type) return

      const symbol = checker.getSymbolAtLocation(fn.name)
      if (!symbol.valueDeclaration) return
      const type = checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration)

      analyzeResult.declarationModule[type['id']] = outPath
      module.functions.push({
        id: type['id'],
        name: fn.name.text,
        documentation: getDocs(symbol),
        ...serializeFunction(type),
      })
    }
    else if (node.kind === ts.SyntaxKind.VariableStatement) {
      (<ts.VariableStatement>node).declarationList.declarations.forEach(d => {
        if (d.name.kind !== ts.SyntaxKind.Identifier) return
        const symbol = checker.getSymbolAtLocation(d.name)
        if (!symbol.valueDeclaration) return
        const type = checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration)
        const properties = getPropsType(type)

        analyzeResult.declarationModule[type['id']] = outPath
        if (properties) {
          // analyzeResult.declarationModule[type['id']] = outPath
          module.components.push({
            id: type['id'],
            name: d.name.text,
            documentation: getDocs(symbol),
            properties,
          })
        }
        // It's not a component
        else {
          if (isFunctionType(type)) {
            module.functions.push({
              id: type['id'],
              name: d.name.text,
              documentation: getDocs(symbol),
              ...serializeFunction(type),
            })
          }
          else if (symbol.valueDeclaration && symbol.valueDeclaration['initializer']) {
            const declaration = symbol.valueDeclaration as ts.VariableDeclaration
            module.variables.push({
              id: type['id'],
              name: d.name.text,
              documentation: getDocs(symbol),
              type: serializeTypeBound(type),
              value: declaration.initializer!.getText(),
            })
          }
        }
      })
    }
  }

  function getDocs(symbol: ts.Symbol) {
    return ts.displayPartsToString(symbol.getDocumentationComment())
  }

  function serializeClass(type: ts.Type) {
    const constructSignature = type.getConstructSignatures()[0]
    if (!constructSignature) return
    const instanceType = constructSignature.getReturnType()

    const properties = [] as Array<DocEntry>
    const methods = [] as Array<FunctionDocEntry>

    instanceType.getProperties().forEach(p => {
      const type = checker.getTypeOfSymbolAtLocation(p, p.valueDeclaration!)
      if (isFunctionType(type)) {
        methods.push({
          name: p.getName(),
          documentation: getDocs(p),
          ...serializeFunction(type),
        })
      }
      else {
        properties.push(serializeSymbol(p))
      }
    })

    return {
      constructors: [],
      properties,
      methods,
    }
  }

  function serializeFunction(type: ts.Type) {
    const callSignature = type.getCallSignatures()[0]
    const typeParameters = callSignature.getTypeParameters()

    return {
      typeParameters: typeParameters && typeParameters.map(serializeTypeBound),
      parameters: callSignature.getParameters().map(serializeTypeProperty),
      returnType: serializeTypeBound(callSignature.getReturnType()),
    }
  }

  function serializeType(type: ts.Type): Array<TypeProperty> {
    console.error('serializeType', type['id'])
    if (type['types']) {
      return serializeInsersectionType(type as ts.UnionOrIntersectionType)
    }
    if (type.aliasSymbol && type.aliasTypeArguments && type.aliasSymbol.getName() === 'Readonly') {
      const aliasSymbol = type.aliasTypeArguments[0].aliasSymbol
      if (aliasSymbol) {
        return serializeType(checker.getDeclaredTypeOfSymbol(aliasSymbol))
      }
      else {
        return serializeType(type.aliasTypeArguments[0])
      }
    }

    return type.getProperties().map(serializeTypeProperty)
  }

  function serializeInsersectionType(type: ts.UnionOrIntersectionType) {
    return type.types.reduce((a, t) => [...a, ...serializeType(t)], [] as Array<TypeProperty>)
  }

  function serializeSymbol(symbol: ts.Symbol, atLocation = symbol.valueDeclaration): DocEntry {
    return {
      name: symbol.getName(),
      documentation: getDocs(symbol),
      type: serializeTypeBound(
        atLocation
          ? checker.getTypeOfSymbolAtLocation(symbol, atLocation)
          : checker.getDeclaredTypeOfSymbol(symbol)
      ),
    }
  }

  function serializeTypeProperty(symbol: ts.Symbol) {
    const property = serializeSymbol(symbol) as TypeProperty
    const valueDeclaration = symbol.valueDeclaration as ts.PropertySignature
    property.optional = !!(valueDeclaration && valueDeclaration.questionToken)
    return property
  }

  function serializeNamedTypeBound(type: ts.Type): TypeBound {
    const typeArguments = type.aliasTypeArguments || (type as ts.TypeReference).typeArguments
    const aliasType = type.aliasSymbol && checker.getDeclaredTypeOfSymbol(type.aliasSymbol) || type

    return {
      kind: 'Named',
      name: checker
        .typeToString(type, undefined, ts.TypeFormatFlags.WriteArrayAsGenericType)
        .split('<')[0],
      parameters: typeArguments && typeArguments.map(serializeTypeBound),
      id: aliasType['id'],
    }
  }

  function serializeTypeBound(type: ts.Type): TypeBound {
    if (type.aliasSymbol) {
      return serializeNamedTypeBound(type)
    }
    if (type.flags & ts.TypeFlags.Object) {
      let type_ = type as ts.ObjectType
      if (type_.objectFlags & ts.ObjectFlags.ObjectLiteral) {
        console.error('object', type)
        console.error('object', checker.typeToString(type))
        // return {
        //   kind: 'Object',
        //   properties: (type as ts.Object).types.map(serializeTypeBound),
        // }
      } else if (type_.objectFlags & ts.ObjectFlags.Anonymous) {
        const callSignatures = checker.getSignaturesOfType(type, ts.SignatureKind.Call)

        if (callSignatures && callSignatures[0]) {
          const signature = callSignatures[0] as ts.Signature

          return {
            kind: 'Function',
            typeParameters: signature.typeParameters && signature.typeParameters.map(serializeTypeBound),
            parameters: signature.parameters.map(parameter => ({
              name: parameter.name,
              type: serializeTypeBound(
                parameter.valueDeclaration
                  ? checker.getTypeOfSymbolAtLocation(parameter, parameter.valueDeclaration)
                  : checker.getDeclaredTypeOfSymbol(parameter)
              ),
            })),
            returnType: serializeTypeBound(signature.getReturnType()),
          }
        } else {
          const index = type.getStringIndexType()
          const indexName = type['stringIndexInfo'] && type['stringIndexInfo'].declaration &&
            Object.keys(type['stringIndexInfo'].declaration.symbol.declarations[0].locals)[0]
          return {
            kind: 'Object',
            properties: type.getProperties().map(property => ({
              name: property.name,
              type: serializeTypeBound(
                property.valueDeclaration
                  ? checker.getTypeOfSymbolAtLocation(property, property.valueDeclaration)
                  : checker.getDeclaredTypeOfSymbol(property)
              ),
            })),
            index: index && {name: indexName, type: serializeTypeBound(index)},
          }
        }
      } else if (type_.objectFlags & ts.ObjectFlags.Interface) {
      } else if (type_.objectFlags & ts.ObjectFlags.Reference) {
      } else {
        console.error('else', type)
        console.error('else', checker.typeToString(type))
      }
    }
    if (type.flags & ts.TypeFlags.Intersection) {
      return {
        kind: 'Intersection',
        types: (type as ts.UnionOrIntersectionType).types.map(serializeTypeBound),
      }
    }
    if (type.flags & ts.TypeFlags.Union && !(type.flags & ts.TypeFlags.Boolean)) {
      return {
        kind: 'Union',
        types: (type as ts.UnionOrIntersectionType).types.map(serializeTypeBound),
      }
    }
    if (type.flags & ts.TypeFlags.BooleanLiteral) {
      return {
        kind: 'BooleanLiteral',
        value: (type as ts.LiteralType).text,
      }
    }
    if (type.flags & ts.TypeFlags.NumberLiteral) {
      return {
        kind: 'NumberLiteral',
        value: (type as ts.LiteralType).text,
      }
    }
    if (type.flags & ts.TypeFlags.StringLiteral) {
      return {
        kind: 'StringLiteral',
        value: (type as ts.LiteralType).text,
      }
    }
    return serializeNamedTypeBound(type)
  }

  function serializeTypeDeclaration(symbol: ts.Symbol) {
    const details = serializeSymbol(symbol) as TypeDeclaration
    console.error('symbol', checker.getDeclaredTypeOfSymbol(symbol)['id'])

    let type = checker.getDeclaredTypeOfSymbol(symbol)
    details.id = type['id']
    const properties = type.getProperties()
    details.properties = properties.map(serializeTypeProperty)
    return details
  }

  /** True if this is visible outside this file, false otherwise */
  function isNodeExported(node: ts.Node): boolean {
    return !!(
      (node.flags & ts.NodeFlags.ExportContext) !== 0 ||
      (node.parent && node.parent.kind === ts.SyntaxKind.SourceFile)
    )
  }

  function getPropsType(type: ts.Type): Array<TypeProperty>|undefined {
    return getClassComponentPropsType(type) || getFunctionComponentPropsType(type)
  }

  function getClassComponentPropsType(type: ts.Type): Array<TypeProperty>|undefined {
    const constructSignature = type.getConstructSignatures()[0]
    if (!constructSignature) return
    const instanceType = constructSignature.getReturnType()
    const props = instanceType.getProperty('props')
    const render = instanceType.getProperty('render')
    if (!props || !render) return
    if (!props.valueDeclaration) return
    if (!render.valueDeclaration) return
    const renderType = checker.getTypeOfSymbolAtLocation(render, render.valueDeclaration)
    const callSignature = renderType.getCallSignatures()[0]
    if (!callSignature) return
    if (callSignature.parameters.length !== 0) return
    if (!isJsxType(callSignature.getReturnType().symbol)) return

    const propsType = checker.getTypeOfSymbolAtLocation(props, props.valueDeclaration)

    if (!propsType) return
    return serializeType(propsType)
  }

  function getFunctionComponentPropsType(type: ts.Type): Array<TypeProperty>|undefined {
    const callSignature = type.getCallSignatures()[0]
    if (!callSignature) return
    if (callSignature.parameters.length > 2) return
    if (!isJsxType(callSignature.getReturnType().symbol)) return
    const propsParameter = callSignature.parameters[0]
    const propsType = propsParameter && (
      propsParameter.valueDeclaration
        ? checker.getTypeOfSymbolAtLocation(propsParameter, propsParameter.valueDeclaration)
        : checker.getDeclaredTypeOfSymbol(propsParameter)
    )

    return propsType
      ? serializeType(propsType)
      : []
  }

  function isFunctionType(type: ts.Type) {
    return !!type.getCallSignatures()[0]
  }

  function isJsxType(symbol?: ts.Symbol): boolean {
    if (!symbol) return false
    return checker.getFullyQualifiedName(symbol) === 'global.JSX.Element'
  }
}

export function analyzePackage(packagePath: string): Package {
  const packageJsonPath = join(packagePath, 'package.json')
  const tsconfigJsonPath = join(packagePath, 'tsconfig.json')
  if (!fs.existsSync(packageJsonPath) || !fs.existsSync(tsconfigJsonPath)) {
    throw 'The package folder does not contain package.json and tsconfig.json files'
  }

  const packageJson = require(packageJsonPath)
  const tsconfigJson = require(tsconfigJsonPath)
  const compilerOptions = tsconfigJson.compilerOptions as ts.CompilerOptions

  if (!compilerOptions.outDir) {
    throw 'The tsconfig.json must specify an outDir'
  }

  const analyzeResult: Package = {
    name: packageJson.name,
    mainModule: packageJson.main && normalize(packageJson.main),
    outDir: compilerOptions.outDir,
    declarationModule: {},
    modules: {},
    readmes: {},
  }

  const filePaths = glob.sync('src/**/*.{ts,tsx}', {
    cwd: packagePath,
    root: packagePath,
    realpath: true,
  })

  analyze(filePaths, analyzeResult, packagePath)

  const readmePaths = glob.sync('src/**/README.md', {
    cwd: packagePath,
    root: packagePath,
    realpath: true,
  })

  readmePaths.forEach(readme => {
    const relativePath = relative(packagePath, readme)
    const outPath = dirname(join(analyzeResult.outDir, relativePath))
    analyzeResult.readmes[outPath] = fs.readFileSync(readme, {encoding: 'utf-8'})
  })
  const root = join(analyzeResult.outDir, 'src')
  if (!analyzeResult.readmes[root]) {
    if (fs.existsSync(join(packagePath, 'README.md'))) {
      analyzeResult.readmes[root] = fs.readFileSync(join(packagePath, 'README.md'), {encoding: 'utf-8'})
    }
  }

  return analyzeResult
}
