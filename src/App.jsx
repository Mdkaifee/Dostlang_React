import { useEffect, useMemo, useRef, useState } from 'react'

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

function stripInlineComment(line) {
  let quote = null
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i]
    if ((ch === '"' || ch === "'") && line[i - 1] !== '\\') {
      if (quote === ch) quote = null
      else if (!quote) quote = ch
    }
    if (ch === '#' && !quote) return line.slice(0, i)
  }
  return line
}

function stripSemicolon(value) {
  return value.trim().replace(/;$/, '').trim()
}

function adaptExpr(expr) {
  return expr
    .replace(/\bsach\b/g, 'true')
    .replace(/\bjhoot\b/g, 'false')
    .replace(/\baur\b/g, '&&')
    .replace(/\bya\b/g, '||')
    .replace(/\bnahi\b/g, '!')
}

function compileToJs(code) {
  const lines = code.split('\n')
  let guardCounter = 0

  return lines
    .map((raw) => stripInlineComment(raw).replace(/\s+$/, ''))
    .map((line) => {
      const trimmed = line.trim()
      if (!trimmed) return ''

      const indent = line.slice(0, line.length - trimmed.length)

      const chainedElseIf = trimmed.match(/^}\s*agar\s+(.+)\s*{$/)
      if (chainedElseIf) {
        return `${indent}} else if (${adaptExpr(stripSemicolon(chainedElseIf[1]))}) {`
      }

      if (/^}\s*warna\s*{$/.test(trimmed)) {
        return `${indent}} else {`
      }

      if (trimmed === '{' || trimmed === '}') {
        return `${indent}${trimmed}`
      }

      if (/^warna\s*{$/.test(trimmed)) {
        return `${indent}else {`
      }

      const ifMatch = trimmed.match(/^agar\s+(.+)\s*{$/)
      if (ifMatch) {
        return `${indent}if (${adaptExpr(stripSemicolon(ifMatch[1]))}) {`
      }

      const whileMatch = trimmed.match(/^jabtak\s+(.+)\s*{$/)
      if (whileMatch) {
        guardCounter += 1
        const cond = adaptExpr(stripSemicolon(whileMatch[1]))
        return `${indent}for (let __loopGuard${guardCounter} = 0; __loopGuard${guardCounter} < 10000 && (${cond}); __loopGuard${guardCounter}++) {`
      }

      const declare = trimmed.match(/^yeh_ha\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)$/)
      if (declare) {
        return `${indent}let ${declare[1]} = ${adaptExpr(stripSemicolon(declare[2]))};`
      }

      const print = trimmed.match(/^dost_bol\s+(.+)$/)
      if (print) {
        return `${indent}__out.push(${adaptExpr(stripSemicolon(print[1]))});`
      }

      const assign = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)$/)
      if (assign) {
        return `${indent}${assign[1]} = ${adaptExpr(stripSemicolon(assign[2]))};`
      }

      return `${indent}${adaptExpr(stripSemicolon(trimmed))};`
    })
    .join('\n')
}

function executeDost(code) {
  const jsCode = compileToJs(code)

  try {
    const runner = new Function(`"use strict"; const __out = []; ${jsCode}; return __out;`)
    const output = runner()
    return {
      ok: true,
      lines: output.map((item) => String(item)),
    }
  } catch (error) {
    return {
      ok: false,
      lines: [String(error?.message || error)],
    }
  }
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

function CodeLines({ code }) {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef(null)
  const lines = code.split('\n')

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    },
    [],
  )

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setCopied(false), 1300)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="code-wrap">
      <button className={`copy-fab ${copied ? 'copied' : ''}`} type="button" onClick={onCopy} aria-label="Copy code">
        {copied ? '✓' : '⧉'}
      </button>
      {copied ? <span className="copy-badge">Copied!</span> : null}

      <div className="code-grid">
        <pre className="code-panel">
          {lines.map((line, index) => (
            <div className="code-row" key={`line-${index}`}>
              {highlightLine(line)}
            </div>
          ))}
        </pre>
      </div>
    </div>
  )
}

function App() {
  const [playgroundCode, setPlaygroundCode] = useState(playgroundSample)
  const [terminalLines, setTerminalLines] = useState([])
  const [runOk, setRunOk] = useState(true)
  const [playCopied, setPlayCopied] = useState(false)
  const copyTimeoutRef = useRef(null)

  const lineNumbers = useMemo(() => {
    const count = Math.max(playgroundCode.split('\n').length, 1)
    return Array.from({ length: count }, (_, idx) => idx + 1)
  }, [playgroundCode])

  useEffect(
    () => () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
    },
    [],
  )

  const onCopyPlayground = async () => {
    try {
      await navigator.clipboard.writeText(playgroundCode)
      setPlayCopied(true)
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
      copyTimeoutRef.current = setTimeout(() => setPlayCopied(false), 1300)
    } catch {
      setPlayCopied(false)
    }
  }

  const onClear = () => {
    setPlaygroundCode('')
    setTerminalLines([])
    setRunOk(true)
  }

  const onRun = () => {
    const result = executeDost(playgroundCode)
    if (result.ok) {
      const lines = result.lines.length ? result.lines.map((line) => `> ${line}`) : ['> (no output)']
      setTerminalLines(['Shandaar bhai 🎉', ...lines])
      setRunOk(true)
    } else {
      setTerminalLines(['Arre yaar, error aa gaya', `> ${result.lines[0]}`])
      setRunOk(false)
    }
  }

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

        <div className="playground-editor-wrap code-wrap">
          <button
            className={`copy-fab ${playCopied ? 'copied' : ''}`}
            onClick={onCopyPlayground}
            type="button"
            aria-label="Copy playground code"
          >
            {playCopied ? '✓' : '⧉'}
          </button>
          {playCopied ? <span className="copy-badge">Copied!</span> : null}

          <div className="editor-grid">
            <pre className="line-column" aria-hidden="true">
              {lineNumbers.map((num) => (
                <span key={`line-${num}`}>{num}</span>
              ))}
            </pre>

            <textarea
              className="editor-input"
              value={playgroundCode}
              onChange={(event) => setPlaygroundCode(event.target.value)}
              spellCheck={false}
            />
          </div>
        </div>

        <div className="terminal-shell">
          {terminalLines.length ? (
            terminalLines.map((line, idx) => (
              <div
                key={`term-${idx}`}
                className={`terminal-line ${idx === 0 ? (runOk ? 'success' : 'error') : ''}`}
              >
                {line}
              </div>
            ))
          ) : (
            <div className="terminal-line muted">Run to see output...</div>
          )}
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
