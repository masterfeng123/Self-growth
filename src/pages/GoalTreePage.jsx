import { useState } from 'react'
import { Plus, ChevronRight, ChevronDown, Trash2, Check, Pilcrow, Link2 } from 'lucide-react'
import { useStore } from '../store/useStore'

// ── Level metadata ────────────────────────────────────────
const LEVELS = [
  { label: '主題',    emoji: '🎯', desc: '最大的方向',   color: '#f59e0b', border: 'rgba(245,158,11,0.3)',  bg: 'rgba(245,158,11,0.08)' },
  { label: '目標',    emoji: '📌', desc: '具體想達成的',  color: '#60a5fa', border: 'rgba(96,165,250,0.3)',  bg: 'rgba(96,165,250,0.07)' },
  { label: '里程碑',  emoji: '🗓', desc: '可衡量的檢查點', color: '#a78bfa', border: 'rgba(167,139,250,0.3)', bg: 'rgba(167,139,250,0.07)' },
  { label: '任務',    emoji: '✅', desc: '具體的工作項目', color: '#34d399', border: 'rgba(52,211,153,0.3)',  bg: 'rgba(52,211,153,0.07)' },
  { label: '今日行動', emoji: '⚡', desc: '最小可執行單位', color: '#fb923c', border: 'rgba(251,146,60,0.3)',  bg: 'rgba(251,146,60,0.07)' },
]

const PILLARS = [
  { key: 'learning',   label: '📚 學習成長' },
  { key: 'networking', label: '🤝 人脈經營' },
  { key: 'deepWork',   label: '🎯 深度工作' },
  { key: 'knowledge',  label: '💡 知識輸入' },
]

// ── Inline text editor ────────────────────────────────────
function InlineEdit({ value, onSave, placeholder, style }) {
  const [editing, setEditing] = useState(!value)
  const [text, setText] = useState(value || '')

  if (!editing) {
    return (
      <span
        onClick={() => setEditing(true)}
        style={{ cursor: 'text', ...style }}
      >
        {value}
      </span>
    )
  }
  return (
    <input
      autoFocus
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={() => { if (text.trim()) { onSave(text.trim()); setEditing(false) } else setEditing(false) }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && text.trim()) { onSave(text.trim()); setEditing(false) }
        if (e.key === 'Escape') setEditing(false)
      }}
      placeholder={placeholder}
      style={{
        background: 'transparent',
        border: 'none',
        borderBottom: '1px solid rgba(255,255,255,0.2)',
        outline: 'none',
        color: '#f0f0f4',
        fontSize: 'inherit',
        fontWeight: 'inherit',
        padding: '0 2px',
        width: '100%',
        ...style,
      }}
    />
  )
}

// ── Single node ───────────────────────────────────────────
function GoalNode({ node, depth = 0 }) {
  const { goals, addGoalNode, updateGoalNode, deleteGoalNode, getGoalChildren, updatePillar, getTodayLog } = useStore()
  const [open, setOpen] = useState(depth < 2)
  const [adding, setAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [showActions, setShowActions] = useState(false)

  const children = getGoalChildren(node.id)
  const level = LEVELS[Math.min(node.level, 4)]
  const nextLevel = LEVELS[Math.min(node.level + 1, 4)]
  const isLeaf = node.level >= 4
  const hasChildren = children.length > 0

  const addChild = () => {
    if (newTitle.trim()) {
      addGoalNode(node.id, newTitle.trim())
      setNewTitle('')
      setAdding(false)
      setOpen(true)
    }
  }

  const linkToToday = () => {
    if (!node.pillar) return
    updatePillar(node.pillar, { done: true, notes: node.title })
  }

  return (
    <div style={{ marginLeft: depth === 0 ? 0 : '20px' }}>
      <div
        style={{
          display: 'flex', alignItems: 'flex-start', gap: '8px',
          padding: '8px 10px', borderRadius: '8px',
          border: `1px solid ${showActions ? level.border : 'transparent'}`,
          background: showActions ? level.bg : 'transparent',
          transition: 'all 150ms cubic-bezier(0.4,0,0.2,1)',
          cursor: 'default',
          opacity: node.done ? 0.5 : 1,
        }}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* Expand / leaf indicator */}
        <button
          onClick={() => hasChildren && setOpen(!open)}
          style={{
            marginTop: '2px', flexShrink: 0, background: 'none', border: 'none',
            cursor: hasChildren ? 'pointer' : 'default',
            color: hasChildren ? level.color : 'transparent',
            padding: 0,
          }}
        >
          {hasChildren
            ? (open ? <ChevronDown size={13} /> : <ChevronRight size={13} />)
            : <span style={{ fontSize: '13px' }}>{level.emoji}</span>
          }
        </button>

        {/* Title */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            {hasChildren && (
              <span style={{ fontSize: '13px' }}>{level.emoji}</span>
            )}
            <span style={{
              fontSize: depth === 0 ? '14px' : '13px',
              fontWeight: depth === 0 ? 600 : depth === 1 ? 500 : 400,
              color: node.done ? '#5e5e68' : (depth === 0 ? '#f0f0f4' : '#c4c4cc'),
              textDecoration: node.done ? 'line-through' : 'none',
              letterSpacing: depth === 0 ? '-0.01em' : 'normal',
            }}>
              {node.title}
            </span>
            <span style={{
              fontSize: '10px', padding: '1px 6px', borderRadius: '99px',
              background: level.bg, color: level.color,
              border: `1px solid ${level.border}`,
              flexShrink: 0,
            }}>
              {level.label}
            </span>
          </div>

          {/* Pillar tag */}
          {node.pillar && (
            <span style={{ fontSize: '10px', color: '#5e5e68', marginTop: '2px', display: 'block' }}>
              連結至 {PILLARS.find(p => p.key === node.pillar)?.label}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          opacity: showActions ? 1 : 0,
          transition: 'opacity 150ms',
          flexShrink: 0,
        }}>
          {/* Link leaf to pillar */}
          {isLeaf && (
            <select
              value={node.pillar || ''}
              onChange={(e) => updateGoalNode(node.id, { pillar: e.target.value || null })}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#161618', border: '1px solid #242729', borderRadius: '4px',
                color: '#909098', fontSize: '10px', padding: '2px 4px', cursor: 'pointer',
              }}
            >
              <option value="">連結支柱…</option>
              {PILLARS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
            </select>
          )}

          {/* Add to today */}
          {isLeaf && node.pillar && !node.done && (
            <button
              onClick={(e) => { e.stopPropagation(); linkToToday() }}
              title="加入今日"
              style={{
                background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)',
                borderRadius: '4px', padding: '2px 6px', fontSize: '10px', color: '#f59e0b',
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              今日 +
            </button>
          )}

          {/* Add child */}
          {!isLeaf && (
            <button
              onClick={(e) => { e.stopPropagation(); setAdding(true); setOpen(true) }}
              title={`新增${nextLevel.label}`}
              style={{
                background: 'none', border: 'none', color: '#5e5e68',
                cursor: 'pointer', padding: '2px', borderRadius: '4px',
                transition: 'color 150ms',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#f0f0f4'}
              onMouseLeave={e => e.currentTarget.style.color = '#5e5e68'}
            >
              <Plus size={13} />
            </button>
          )}

          {/* Toggle done */}
          <button
            onClick={(e) => { e.stopPropagation(); updateGoalNode(node.id, { done: !node.done }) }}
            title="標記完成"
            style={{
              background: node.done ? 'rgba(52,211,153,0.15)' : 'none',
              border: 'none', color: node.done ? '#34d399' : '#5e5e68',
              cursor: 'pointer', padding: '2px', borderRadius: '4px', transition: 'all 150ms',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#34d399'}
            onMouseLeave={e => e.currentTarget.style.color = node.done ? '#34d399' : '#5e5e68'}
          >
            <Check size={13} />
          </button>

          {/* Delete */}
          <button
            onClick={(e) => { e.stopPropagation(); deleteGoalNode(node.id) }}
            title="刪除"
            style={{
              background: 'none', border: 'none', color: '#5e5e68',
              cursor: 'pointer', padding: '2px', borderRadius: '4px', transition: 'color 150ms',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
            onMouseLeave={e => e.currentTarget.style.color = '#5e5e68'}
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Children */}
      {open && hasChildren && (
        <div style={{
          marginLeft: '10px',
          paddingLeft: '10px',
          borderLeft: `1px solid ${level.border}`,
          marginTop: '2px',
        }}>
          {children.map((child) => (
            <GoalNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}

      {/* Inline add child form */}
      {adding && (
        <div style={{
          marginLeft: depth === 0 ? '30px' : '30px',
          marginTop: '4px',
          display: 'flex', gap: '6px', alignItems: 'center',
        }}>
          <span style={{ fontSize: '12px' }}>{nextLevel.emoji}</span>
          <input
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addChild()
              if (e.key === 'Escape') { setAdding(false); setNewTitle('') }
            }}
            placeholder={`新增${nextLevel.label}…`}
            style={{
              flex: 1, background: '#111113', border: `1px solid ${nextLevel.border}`,
              borderRadius: '6px', padding: '5px 10px', fontSize: '12px',
              color: '#f0f0f4', outline: 'none',
            }}
          />
          <button onClick={addChild} className="btn-primary" style={{ height: 28, padding: '0 10px', fontSize: '12px' }}>
            加入
          </button>
          <button onClick={() => { setAdding(false); setNewTitle('') }} className="btn-ghost" style={{ height: 28, padding: '0 8px', fontSize: '12px' }}>
            取消
          </button>
        </div>
      )}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────
export default function GoalTreePage() {
  const { goals, goalRoots, addGoalNode, getGoalChildren } = useStore()
  const [newTheme, setNewTheme] = useState('')
  const [adding, setAdding] = useState(false)

  const rootNodes = goalRoots
    .map((id) => goals[id])
    .filter(Boolean)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  const totalNodes = Object.keys(goals).length
  const doneNodes = Object.values(goals).filter(n => n.done).length

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px 60px' }}>

      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#f0f0f4', letterSpacing: '-0.02em' }}>
          任務樹
        </h1>
        <p style={{ fontSize: '12px', color: '#5e5e68', marginTop: '3px' }}>
          從籠統到具體，每個大夢想都能拆解成今天可以做的事
        </p>
      </div>

      {/* Level legend */}
      <div style={{
        display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px',
        padding: '12px', background: '#111113', borderRadius: '10px',
        border: '1px solid #242729',
      }}>
        {LEVELS.map((lv, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ fontSize: '12px' }}>{lv.emoji}</span>
            <span style={{ fontSize: '11px', color: lv.color, fontWeight: 500 }}>{lv.label}</span>
            {i < LEVELS.length - 1 && (
              <ChevronRight size={10} style={{ color: '#3e3e48' }} />
            )}
          </div>
        ))}
        {totalNodes > 0 && (
          <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#5e5e68' }}>
            {doneNodes}/{totalNodes} 完成
          </span>
        )}
      </div>

      {/* Tree */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {rootNodes.length === 0 && !adding && (
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            color: '#5e5e68', border: '1px dashed #2e3033', borderRadius: '12px',
          }}>
            <p style={{ fontSize: '32px', marginBottom: '10px' }}>🎯</p>
            <p style={{ fontSize: '14px', fontWeight: 500, color: '#909098', marginBottom: '6px' }}>
              從一個大主題開始
            </p>
            <p style={{ fontSize: '12px' }}>
              例如：「技術力突破」「建立個人品牌」「人脈網絡擴展」
            </p>
          </div>
        )}

        {rootNodes.map((node) => (
          <GoalNode key={node.id} node={node} depth={0} />
        ))}

        {/* Add theme */}
        {adding ? (
          <div style={{
            display: 'flex', gap: '8px', alignItems: 'center',
            padding: '10px', background: '#111113', borderRadius: '10px',
            border: '1px solid rgba(245,158,11,0.25)', marginTop: '4px',
          }}>
            <span style={{ fontSize: '16px' }}>🎯</span>
            <input
              autoFocus
              value={newTheme}
              onChange={(e) => setNewTheme(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newTheme.trim()) {
                  addGoalNode(null, newTheme.trim())
                  setNewTheme('')
                  setAdding(false)
                }
                if (e.key === 'Escape') { setAdding(false); setNewTheme('') }
              }}
              placeholder="新主題名稱… （例：技術力突破）"
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                fontSize: '14px', fontWeight: 500, color: '#f0f0f4',
              }}
            />
            <button
              onClick={() => {
                if (newTheme.trim()) {
                  addGoalNode(null, newTheme.trim())
                  setNewTheme('')
                  setAdding(false)
                }
              }}
              className="btn-primary"
              style={{ height: 30, padding: '0 12px', fontSize: '12px' }}
            >
              新增
            </button>
            <button onClick={() => { setAdding(false); setNewTheme('') }} className="btn-ghost" style={{ height: 30 }}>
              取消
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 14px', borderRadius: '10px', cursor: 'pointer',
              border: '1px dashed #2e3033', background: 'transparent',
              color: '#5e5e68', fontSize: '13px', marginTop: '4px',
              transition: 'all 150ms cubic-bezier(0.4,0,0.2,1)',
              width: '100%',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(245,158,11,0.4)'
              e.currentTarget.style.color = '#f59e0b'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#2e3033'
              e.currentTarget.style.color = '#5e5e68'
            }}
          >
            <Plus size={14} />
            新增主題
          </button>
        )}
      </div>

      {/* How-to hint */}
      {rootNodes.length > 0 && (
        <div style={{
          marginTop: '32px', padding: '14px 16px',
          background: '#111113', borderRadius: '10px', border: '1px solid #1e1e21',
        }}>
          <p style={{ fontSize: '11px', fontWeight: 600, color: '#5e5e68', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            使用提示
          </p>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {[
              '📌 點 + 按鈕，在任何節點下新增下一層',
              '⚡ 最底層（今日行動）可以連結到四大支柱，點「今日 +」直接加進今天',
              '✅ 點勾勾標記完成，節點會淡化但保留',
              '🖱 滑鼠移到節點上才會顯示操作按鈕',
            ].map((tip, i) => (
              <li key={i} style={{ fontSize: '12px', color: '#5e5e68' }}>{tip}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
