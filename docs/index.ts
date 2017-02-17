// import {start} from 'documittu'
import ReactMarkdown from 'react-markdown'
import {start} from '../template/src/index'

start(require.context('./pages', true, /^\.\/.*\.md$/))
