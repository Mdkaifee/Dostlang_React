import { useMemo, useState } from 'react'

const playgroundSample = `hi bhai
  bol bhai "Hello World";

  bhai ye hai a = 3;
  bhai ye hai b = 0;

  jab tak bhai (b < 5) {
    bol bhai b;

    agar bhai (b == a) {
      bol bhai "b is equal to a";
    } nahi to bhai (b == 0) {
      bol bhai "b is equal to zero";
    }

    b += 1;
  }

bye bhai`

const docBlocks = {
  general: `This will be ignored

hi bhai
  // Write code here
bye bhai

This too`,
  variables: `hi bhai
  bhai ye hai a = 10;
  bhai ye hai b = "two";
  bhai ye hai c = 15;
  a = a + 1;
  b = 21;
  c *= 2;
bye bhai`,
  types: `hi bhai
  bhai ye hai a = 10;
  bhai ye hai b = 10 + (15*20);
  bhai ye hai c = "two";
  bhai ye hai d = 'ok';
  bhai ye hai e = nalla;
  bhai ye hai f = sahi;
  bhai ye hai g = galat;
bye bhai`,
  builtins: `hi bhai
  bol bhai "Hello World";
  bhai ye hai a = 10;
  {
    bhai ye hai b = 20;
    bol bhai a + b;
  }
  bol bhai 5, 'ok', nalla , sahi , galat;
bye bhai`,
  conditionals: `hi bhai
  bhai ye hai a = 10;
  agar bhai (a < 20) {
    bol bhai "a is less than 20";
  } nahi to bhai ( a < 25 ) {
    bol bhai "a is less than 25";
  } warna bhai {
    bol bhai "a is greater than or equal to 25";
  }
bye bhai`,
  loops: `hi bhai
  bhai ye hai a = 0;
  jab tak bhai (a < 10) {
    a += 1;
    agar bhai (a == 5) {
      bol bhai "andar se bol bhai ", a;
      agla dekh bhai;
    }
    agar bhai (a == 6) {
      bas kar bhai;
    }
    bol bhai a;
  }
  bol bhai "done";
bye bhai`,
}

const keywordSet = new Set([
  'hi',
  'bhai',
  'bol',
  'ye',
  'hai',
  'jab',
  'tak',
  'agar',
  'nahi',
  'to',
  'warna',
  'bye',
  'nalla',
  'sahi',
  'galat',
  'bas',
  'kar',
  'agla',
  'dekh',
])

function InlineTag({ children }) {
  return <code className="inline-tag">{children}</code>
}

function highlightLine(line) {
  const commentIdx = line.indexOf('//')
  const codePart = commentIdx >= 0 ? line.slice(0, commentIdx) : line
  const commentPart = commentIdx >= 0 ? line.slice(commentIdx) : ''
  const tokenRegex = /("[^"]*"|'[^']*'|==|!=|<=|>=|\+=|-=|\*=|\/=|[{}();,]|[+\-*/=<>]|\b[a-zA-Z_][a-zA-Z0-9_]*\b|\d+)/g
  const pieces = codePart.split(tokenRegex)

  return (
    <>
      {pieces.map((piece, idx) => {
        if (!piece) return null

        let cls = 'tok-plain'
        if (/^"[^"]*"$|^'[^']*'$/.test(piece)) {
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
          Bhailang is dynamically typed toy programming language, based on an inside joke, written in Typescript.
        </p>

        <div className="docs-grid">
          <article className="doc-card">
            <h3>General</h3>
            <p>
              <InlineTag>hi bhai</InlineTag> is the entrypoint for the program and all program must end with{' '}
              <InlineTag>bye bhai</InlineTag>. Anything outside of it will be ignored.
            </p>
            <CodeLines code={docBlocks.general} />
          </article>

          <article className="doc-card">
            <h3>Variables</h3>
            <p>
              Variables can be declared using <InlineTag>bhai ye hai</InlineTag>.
            </p>
            <CodeLines code={docBlocks.variables} />
          </article>

          <article className="doc-card">
            <h3>Types</h3>
            <p>
              Numbers and strings are like other languages. Null values can be denoted using <InlineTag>nalla</InlineTag>.{' '}
              <InlineTag>sahi</InlineTag> and <InlineTag>galat</InlineTag> are the boolean values.
            </p>
            <CodeLines code={docBlocks.types} />
          </article>

          <article className="doc-card">
            <h3>Built-ins</h3>
            <p>
              Use <InlineTag>bol bhai</InlineTag> to print anything to console.
            </p>
            <CodeLines code={docBlocks.builtins} />
          </article>

          <article className="doc-card">
            <h3>Conditionals</h3>
            <p>
              Bhailang supports if-else-if ladder construct , <InlineTag>agar bhai</InlineTag> block will execute if condition is{' '}
              <InlineTag>sahi</InlineTag>, otherwise one of the subsequently added <InlineTag>nahi to bhai</InlineTag> blocks will
              execute if their respective condition is <InlineTag>sahi</InlineTag>, and the <InlineTag>warna bhai</InlineTag> block
              will eventually execute if all of the above conditions are <InlineTag>galat</InlineTag>.
            </p>
            <CodeLines code={docBlocks.conditionals} />
          </article>

          <article className="doc-card">
            <h3>Loops</h3>
            <p>
              Statements inside <InlineTag>jab tak bhai</InlineTag> blocks are executed as long as a specified condition evaluates to{' '}
              <InlineTag>sahi</InlineTag>. If the condition becomes <InlineTag>galat</InlineTag>, statement within the loop stops
              executing and control passes to the statement following the loop. Use <InlineTag>bas kar bhai</InlineTag> to break the
              loop and <InlineTag>agla dekh bhai</InlineTag> to continue within loop.
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
