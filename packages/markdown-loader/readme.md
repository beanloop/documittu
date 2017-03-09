This is a fork of [react-markdown-loader](https://github.com/javiercf/react-markdown-loader) that
is customized to fit documittu.

This loader parses markdown files and converts them to a React Stateless Component.
It will also parse FrontMatter to import dependencies and render components
along with it’s source code.

## Usage

In the FrontMatter you should import the components you want to render
with the component name as a key and it's path as the value

```markdown
---
imports:
  HelloWorld: './hello-world.js',
  '{ Component1, Component2 }': './components.js'
---
```


*hello-world.md*

<pre>

---
imports:
  HelloWorld: './hello-world.js'
---
# Hello World

This is an example component

```render html
&lt;HelloWorld /&gt;
```

</pre>
