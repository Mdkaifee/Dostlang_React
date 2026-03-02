import { useMemo, useState } from 'react'

const starterCode = `yeh_ha n = 10
yeh_ha a = 0
yeh_ha b = 1
yeh_ha next = 0
yeh_ha i = 0

jabtak i < n {
  dost_bol a
  next = a + b
  a = b
  b = next
  i = i + 1
}`

const docs = [
  {
    title: 'General',
    body: 'DostLang is a lightweight toy language inspired by conversational Hindi keywords. Programs are simple and expressive.',
    code: `yeh_ha msg = "DostLang rocks"
dost_bol msg`,
  },
  {
    title: 'Variables',
    body: 'Declare variables with yeh_ha. Re-assign later with plain = syntax.',
    code: `yeh_ha a = 10
yeh_ha name = "Kaifee"
a = a + 5
dost_bol name`,
  },
  {
    title: 'Conditionals',
    body: 'Use agar / warna for branching. Conditions support comparison operators.',
    code: `yeh_ha marks = 82
agar marks >= 80 {
  dost_bol "Top"
} warna {
  dost_bol "Keep going"
}`,
  },
  {
    title: 'Loops',
    body: 'Use jabtak to repeat until condition becomes false.',
    code: `yeh_ha i = 1
jabtak i <= 5 {
  dost_bol i
  i = i + 1
}`,
  },
]

function evaluateExpression(expr, env) {
  const normalized = expr
    .replace(/\bsach\b/g, 'true')
    .replace(/\bjhoot\b/g, 'false')

  const keys = Object.keys(env)
  const values = Object.values(env)
  try {
    // Intended as a playground helper, not a secure sandbox.
    return new Function(...keys, `return (${normalized})`)(...values)
  } catch {
    return normalized
  }
}

function runDost(code) {
  const env = {}
  const output = []

  for (const raw of code.split('\n')) {
    const line = raw.trim()
    if (!line || line.startsWith('#') || line.endsWith('{') || line === '}') {
      continue
    }

    const declare = line.match(/^yeh_ha\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)$/)
    if (declare) {
      env[declare[1]] = evaluateExpression(declare[2], env)
      continue
    }

    const assign = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)$/)
    if (assign) {
      env[assign[1]] = evaluateExpression(assign[2], env)
      continue
    }

    const print = line.match(/^dost_bol\s+(.+)$/)
    if (print) {
      output.push(String(evaluateExpression(print[1], env)))
    }
  }

  return output
}

function App() {
  const [code, setCode] = useState(starterCode)
  const [output, setOutput] = useState([])

  const lineNumbers = useMemo(() => {
    const count = Math.max(code.split('\n').length, 10)
    return Array.from({ length: count }, (_, idx) => idx + 1)
  }, [code])

  const onRun = () => setOutput(runDost(code))
  const onClear = () => {
    setCode('')
    setOutput([])
  }

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
    } catch {
      // Ignore clipboard errors in unsupported environments.
    }
  }

  return (
    <main className="page-shell">
      <section className="hero-section">
        <div className="hero-inner">
          <img className="hero-glyph" src="/dostlang.png" alt="DostLang glyph" />
          <h1 className="hero-title">DOSTLANG</h1>
          <p className="hero-subtitle">A toy programming language written in Python</p>
          <code className="install-pill">npm i -g @mdkaifee/dostlang</code>

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
            <a href="https://mdkaifee-software-developer.onrender.com/" target="_blank" rel="noreferrer">
              Md Kaifee
            </a>
          </p>
        </div>
      </section>

      <section className="playground-section" id="playground">
        <div className="section-header">
          <h2>Playground</h2>
          <div className="inline-actions">
            <button className="btn btn-primary" onClick={onRun} type="button">
              Run
            </button>
            <button className="btn btn-ghost" onClick={onClear} type="button">
              Clear
            </button>
          </div>
        </div>

        <div className="editor-shell">
          <button className="copy-btn" type="button" onClick={onCopy} aria-label="Copy code">
            ⧉
          </button>
          <div className="editor-grid">
            <pre className="line-nums" aria-hidden="true">
              {lineNumbers.map((num) => (
                <span key={num}>{num}</span>
              ))}
            </pre>
            <textarea
              className="editor-input"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              spellCheck={false}
            />
          </div>
        </div>

        <div className="output-shell">
          <h3>Output</h3>
          <pre>{output.length ? output.join('\n') : 'Run the code to see output...'}</pre>
        </div>
      </section>

      <section className="docs-section">
        <h2>Documentation</h2>
        <p className="docs-intro">
          DostLang is a dynamically-typed toy programming language built for fun, learning, and rapid experimentation.
        </p>

        <div className="docs-grid">
          {docs.map((item) => (
            <article className="doc-card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              <pre>
                <code>{item.code}</code>
              </pre>
            </article>
          ))}
        </div>
      </section>

      <footer className="site-footer">© 2026 Md Kaifee</footer>
    </main>
  )
}

export default App
