#!/usr/bin/env node
import * as fs from 'fs'
import {analyzePackage} from './index'

const output = analyzePackage(fs.realpathSync(process.argv[2]))

console.log(JSON.stringify(output, undefined, 4))
