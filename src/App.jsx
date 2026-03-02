import { useMemo, useState } from 'react'

const playgroundSample = `yeh_ha a = 3
yeh_ha b = 0

jabtak b < 5 {
  dost_bol b

  agar b == a {
    dost_bol "b is equal to a"
  } warna {
    agar b == 0 {
      dost_bol "b is equal to zero"
    }
  }

  b = b + 1
}`

const docBlocks = {
  general: `# this will be ignored as comment

yeh_ha msg = "DostLang"
dost_bol msg`,
  variables: `yeh_ha a = 10
yeh_ha b = 20
a = a + 1
b = b * 2
dost_bol a
dost_bol b`,
  types: `yeh_ha num = 10
yeh_ha text = "two"
yeh_ha ok = sach
yeh_ha fail = jhoot
dost_bol num
dost_bol text
dost_bol ok
dost_bol fail`,
  builtins: `yeh_ha a = 10
yeh_ha b = 20
dost_bol "Hello World"
dost_bol a + b
dost_bol a == b`,
  conditionals: `yeh_ha a = 10
agar a < 20 {
  dost_bol "a is less than 20"
} warna {
  agar a < 25 {
    dost_bol "a is less than 25"
  } warna {
    dost_bol "a is greater than or equal to 25"
  }
}`,
  loops: `yeh_ha a = 0
jabtak a < 6 {
  a = a + 1
  agar a == 5 {
    dost_bol "special"
  } warna {
    dost_bol a
  }
}
dost_bol "done"`,
}

const keywordSet = new Set(['dost_bol', 'yeh_ha', 'agar', 'warna', 'jabtak', 'sach', 'jhoot', 'aur', 'ya', 'nahi'])

function InlineTag({ children }) {
  return <code className="inline-tag">{children}</code>
}

function highlightLine(line) {
  const commentIdx = line.indexOf('#')
  const codePart = commentIdx >= 0 ? line.slice(0, commentIdx) : line
  const commentPart = commentIdx >= 0 ? line.slice(commentIdx) : ''
  const tokenRegex = /("[^"]*"|==|!=|<=|>=|\+=|-=|\*=|\/=|[{}();,]|[+\-*/=<>]|\b[a-zA-Z_][a-zA-Z0-9_]*\b|\d+)/g
  const pieces = codePart.split(tokenRegex)

  return (
    <>
      {pieces.map((piece, idx) => {
        if (!piece) return null

        let cls = 'tok-plain'
        if (/^"[^"]*"$/.test(piece)) {
          cls = 'tok-string'
        } else if (/^\d+$/.test(piece)) {
          cls = 'tok-number'
        } else if (/^(==|!=|<=|>=|\+=|-=|\*=|\/=|[+\-*/=<>])$/.test(piece)) {
          cls = 'tok-op'
        } else if (/^[{}();,]$/.test(piece)) {
          cls = 'tok-punc'
        } else if (keywordSet.has(piece)) {
          cls = 'tok-key'
        }

        return (
          <span key={`${piece}-${idx}`} className={cls}>
            {piece}
          </span>
        )
      })}
      {commentPart ? <span className="tok-comment">{commentPart}</span> : null}
    </>
  )
}

function CodeLines({ code, withNumbers = false }) {
  const lines = code.split('\n')

  return (
    <div className={`code-grid ${withNumbers ? 'with-lines' : ''}`}>
      {withNumbers ? (
        <pre className="line-column" aria-hidden="true">
          {lines.map((_, index) => (
            <span key={`ln-${index + 1}`}>{index + 1}</span>
          ))}
        </pre>
      ) : null}
      <pre className="code-panel">
        {lines.map((line, index) => (
          <div className="code-row" key={`line-${index}`}>
            {highlightLine(line)}
          </div>
        ))}
      </pre>
    </div>
  )
}

function App() {
  const [playgroundCode, setPlaygroundCode] = useState(playgroundSample)
  const lineCountMemo = useMemo(() => playgroundCode.split('\n').length, [playgroundCode])

  const onClear = () => setPlaygroundCode('')
  const onRun = () => setPlaygroundCode((prev) => prev)
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(playgroundCode)
    } catch {
      // Clipboard is optional.
    }
  }

  const hasCode = lineCountMemo > 0

  return (
    <main className="page-shell">
      <section className="hero-section">
        <div className="hero-inner">
          <h1 className="hero-title">DOSTLANG</h1>
          <p className="hero-subtitle">A toy programming language written in Python</p>
          <code className="install-pill">`npm i -g @mdkaifee/dostlang`</code>

          <div className="hero-actions">
            <a className="btn btn-primary" href="#playground">
              Playground
            </a>
            <a
              className="btn btn-ghost"
              href="https://github.com/Mdkaifee/Dostlang_npm"
              target="_blank"
              rel="noreferrer"
            >
              View Source
            </a>
          </div>

          <p className="made-by">
            Made by{' '}
            <a href="https://github.com/Mdkaifee" target="_blank" rel="noreferrer">
              @mdkaifee
            </a>
          </p>
        </div>
      </section>

      <section className="playground-section" id="playground">
        <div className="section-head">
          <h2>Playground</h2>
          <div className="section-actions">
            <button className="btn btn-primary" onClick={onRun} type="button">
              Run
            </button>
            <button className="btn btn-ghost" onClick={onClear} type="button">
              Clear
            </button>
          </div>
        </div>

        <div className="playground-editor-wrap">
          <button className="copy-btn" onClick={onCopy} type="button" aria-label="Copy code">
            ⧉
          </button>
          {hasCode ? <CodeLines code={playgroundCode} withNumbers /> : <div className="empty-code">No code</div>}
        </div>
      </section>

      <section className="docs-section">
        <h2>Documentation</h2>
        <p className="docs-intro">
          DostLang is a dynamically typed toy programming language written in Python.
        </p>

        <div className="docs-grid">
          <article className="doc-card">
            <h3>General</h3>
            <p>
              Comments start with <InlineTag>#</InlineTag>. Print values using <InlineTag>dost_bol</InlineTag>.
            </p>
            <CodeLines code={docBlocks.general} />
          </article>

          <article className="doc-card">
            <h3>Variables</h3>
            <p>
              Declare variables using <InlineTag>yeh_ha</InlineTag>, then reassign with <InlineTag>=</InlineTag>.
            </p>
            <CodeLines code={docBlocks.variables} />
          </article>

          <article className="doc-card">
            <h3>Types</h3>
            <p>
              Supports numbers, strings, and booleans via <InlineTag>sach</InlineTag> and <InlineTag>jhoot</InlineTag>.
            </p>
            <CodeLines code={docBlocks.types} />
          </article>

          <article className="doc-card">
            <h3>Built-ins</h3>
            <p>
              Use <InlineTag>dost_bol</InlineTag> to print expressions and values.
            </p>
            <CodeLines code={docBlocks.builtins} />
          </article>

          <article className="doc-card">
            <h3>Conditionals</h3>
            <p>
              Use <InlineTag>agar</InlineTag> for if and <InlineTag>warna</InlineTag> for else blocks.
            </p>
            <CodeLines code={docBlocks.conditionals} />
          </article>

          <article className="doc-card">
            <h3>Loops</h3>
            <p>
              Repeat statements using <InlineTag>jabtak</InlineTag> while a condition remains true.
            </p>
            <CodeLines code={docBlocks.loops} />
          </article>
        </div>
      </section>

      <footer className="site-footer">
        © 2026{' '}
        <a href="https://mdkaifee-software-developer.onrender.com/" target="_blank" rel="noreferrer">
          Md Kaifee
        </a>
      </footer>
    </main>
  )
}

export default App
