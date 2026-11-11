'use client'

import { useState } from 'react'

import styles from './CopyCommand.module.css'

/** A one-line command in a box, with a button that copies it. */
export function CopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    void navigator.clipboard?.writeText(command).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }
  return (
    <div className={styles.box}>
      <code className={styles.command}>
        <span className={styles.prompt}>$ </span>
        {command}
      </code>
      <button type="button" className={styles.copy} onClick={copy}>
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}
