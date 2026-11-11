'use client'

import { useEffect, useState } from 'react'

import styles from './Terminal.module.css'

type Line = { command: string; output?: string }

/**
 * A terminal that types each command and then shows what it prints. Copy the output from a real
 * run, and replace it when the command's output changes.
 */
export function Terminal({
  title = 'Terminal',
  lines,
}: {
  title?: string
  lines: Line[]
}) {
  const [run, setRun] = useState(0)
  const [lineIndex, setLineIndex] = useState(0)
  const [typed, setTyped] = useState(0)

  // With reduced motion, show the whole session at once.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      setLineIndex(lines.length)
  }, [lines.length, run])

  const current = lines[lineIndex]
  const doneTyping = current ? typed >= current.command.length : true

  useEffect(() => {
    if (!current) return
    const timer = setTimeout(
      () => {
        if (!doneTyping) setTyped((count) => count + 1)
        else {
          setLineIndex((index) => index + 1)
          setTyped(0)
        }
      },
      doneTyping ? 900 : 35,
    )
    return () => clearTimeout(timer)
  }, [current, doneTyping, typed, run])

  const replay = () => {
    setLineIndex(0)
    setTyped(0)
    setRun((count) => count + 1)
  }

  return (
    <figure className={`not-prose ${styles.terminal}`}>
      <figcaption className={styles.bar}>
        <span className={styles.dots} aria-hidden />
        <span>{title}</span>
        <button type="button" className={styles.replay} onClick={replay}>
          Replay
        </button>
      </figcaption>
      <pre className={styles.screen}>
        {lines.slice(0, lineIndex + 1).map((line, index) => {
          const isCurrent = index === lineIndex
          const shown = isCurrent ? line.command.slice(0, typed) : line.command
          return (
            <span key={index}>
              <span className={styles.prompt}>$ </span>
              {shown}
              {isCurrent && !doneTyping && <span className={styles.cursor} />}
              {'\n'}
              {(!isCurrent || doneTyping) && line.output && (
                <span className={styles.output}>{line.output + '\n'}</span>
              )}
            </span>
          )
        })}
      </pre>
    </figure>
  )
}
