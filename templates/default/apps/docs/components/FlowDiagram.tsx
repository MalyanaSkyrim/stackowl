'use client'

import {
  Background,
  type Edge,
  MarkerType,
  type Node,
  Position,
  ReactFlow,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useEffect, useMemo, useState } from 'react'

import styles from './FlowDiagram.module.css'

type DiagramNode = {
  id: string
  label: string
  /** A second, smaller line under the label. */
  note?: string
  x: number
  y: number
  /** `outside` draws a service we don't run (Apple, Cloudflare…) with a dashed border. */
  kind?: 'ours' | 'outside'
}

type DiagramEdge = { from: string; to: string; label?: string }

type Step = {
  caption: string
  /** The edges this step lights up, as `from>to`. */
  edges: string[]
}

const edgeId = (edge: DiagramEdge) => `${edge.from}>${edge.to}`

/**
 * A diagram whose arrows move. With `steps`, it plays a walk-through: each step lights up its
 * arrows and shows its caption, and the reader can pause or pick a step.
 */
export function FlowDiagram({
  nodes,
  edges,
  steps,
  height = 360,
}: {
  nodes: DiagramNode[]
  edges: DiagramEdge[]
  steps?: Step[]
  height?: number
}) {
  const [stepIndex, setStepIndex] = useState(0)
  const [playing, setPlaying] = useState(true)
  const step = steps?.[stepIndex]

  useEffect(() => {
    if (!steps || !playing) return
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    if (reduced) {
      setPlaying(false)
      return
    }
    const timer = setTimeout(
      () => setStepIndex((index) => (index + 1) % steps.length),
      3200,
    )
    return () => clearTimeout(timer)
  }, [steps, playing, stepIndex])

  const lit = useMemo(() => new Set(step?.edges ?? []), [step])
  const litNodes = useMemo(
    () => new Set([...lit].flatMap((id) => id.split('>'))),
    [lit],
  )

  const flowNodes: Node[] = nodes.map((node) => ({
    id: node.id,
    position: { x: node.x, y: node.y },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    draggable: false,
    connectable: false,
    className: [
      styles.node,
      node.kind === 'outside' ? styles.outside : '',
      step && !litNodes.has(node.id) ? styles.dim : '',
    ].join(' '),
    data: {
      label: (
        <div>
          <div className={styles.label}>{node.label}</div>
          {node.note && <div className={styles.note}>{node.note}</div>}
        </div>
      ),
    },
  }))

  const flowEdges: Edge[] = edges.map((edge) => {
    const id = edgeId(edge)
    const on = !step || lit.has(id)
    return {
      id,
      source: edge.from,
      target: edge.to,
      // During a walk-through only the lit arrows keep their labels, so faded lines stay quiet.
      label: on ? edge.label : undefined,
      animated: on,
      className: on ? styles.edgeOn : styles.edgeOff,
      markerEnd: { type: MarkerType.ArrowClosed },
      labelBgPadding: [4, 2],
      labelBgBorderRadius: 4,
    }
  })

  return (
    <figure className={`not-prose ${styles.figure}`}>
      <div style={{ height }}>
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          fitView
          // Phones need a smaller scale than React Flow's default minimum to fit the whole diagram.
          minZoom={0.2}
          fitViewOptions={{ padding: 0.12 }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          preventScrolling={false}
          proOptions={{ hideAttribution: true }}>
          <Background gap={20} size={1} />
        </ReactFlow>
      </div>
      {steps && (
        <figcaption className={styles.steps}>
          <button
            type="button"
            className={styles.play}
            onClick={() => setPlaying((value) => !value)}>
            {playing ? 'Pause' : 'Play'}
          </button>
          <ol className={styles.stepList}>
            {steps.map((item, index) => (
              <li key={item.caption}>
                <button
                  type="button"
                  aria-current={index === stepIndex}
                  className={styles.stepButton}
                  onClick={() => {
                    setPlaying(false)
                    setStepIndex(index)
                  }}>
                  {index + 1}
                </button>
              </li>
            ))}
          </ol>
          <p className={styles.caption}>{step?.caption}</p>
        </figcaption>
      )}
    </figure>
  )
}
