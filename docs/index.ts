// import {start} from 'documittu-template-beanloop'
import {start} from '../template/src/index'

start('Documittu', require.context('./pages', true, /^\.\/.*\.md$/))
