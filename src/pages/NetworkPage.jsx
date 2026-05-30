import { useState } from 'react'
import { Plus, User, Trash2, Bell, Search } from 'lucide-react'
import { useStore } from '../store/useStore'

const CATEGORIES = [
  { value: 'mentor',   label: '導師',   emoji: '🧭', accent: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)' },
  { value: 'peer',     label: '同儕',   emoji: '👥', accent: '#60a5fa', bg: 'rgba(96,165,250,0.1)',  border: 'rgba(96,165,250,0.25)' },
  { value: 'tech',     label: '技術圈', emoji: '💻', accent: '#34d399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.25)' },
  { value: 'biz',      label: '商業圈', emoji: '💼', accent: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.25)' },
  { value: 'investor', label: '投資人', emoji: '📈', accent: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.25)' },
  { value: 'other',    label: '其他',   emoji: '🔗', accent: '#909098', bg: 'rgba(144,144,152,0.1)', border: 'rgba(144,144,152,0.25)' },
]
const catMap = Object.fromEntries(CATEGORIES.map((c) => [c.value, c]))

const emptyForm = () => ({
  name: '', category: 'peer', context: '', platform: '', followUpDate: '', notes: '',
})

function CategoryBadge({ category }) {
  const cat = catMap[category] || catMap.other
  return (
    <span style={{
      fontSize: '11px', padding: '2px 7px', borderRadius: '99px',
      background: cat.bg, border: `1px solid ${cat.border}`, color: cat.accent,
      fontWeight: 500, whiteSpace: 'nowrap',
    }}>
      {cat.emoji} {cat.label}
    </span>
  )
}

function AddContactModal({ onClose, onSave }) {
  const [form, setForm] = useState(emptyForm())
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '16px',
    }}
      className="md:items-center"
    >
      <div style={{
        background: '#161618', border: '1px solid #242729', borderRadius: '12px',
        width: '100%', maxWidth: 440, maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
      }}>
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid #242729',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <p style={{ fontSize: '14px', fontWeight: 600, color: '#f0f0f4' }}>新增聯絡人</p>
          <button onClick={onClose} style={{ fontSize: '18px', color: '#5e5e68', cursor: 'pointer', background: 'none', border: 'none' }}>×</button>
        </div>
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label className="label">姓名 *</label>
            <input value={form.name} onChange={(e) => set('name', e.target.value)} className="input" placeholder="對方的名字" />
          </div>
          <div>
            <label className="label">關係類型</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {CATEGORIES.map((c) => (
                <button key={c.value} onClick={() => set('category', c.value)} style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  padding: '4px 10px', borderRadius: '99px', fontSize: '12px',
                  border: '1px solid',
                  borderColor: form.category === c.value ? c.border : 'rgba(255,255,255,0.07)',
                  color: form.category === c.value ? c.accent : '#5e5e68',
                  background: form.category === c.value ? c.bg : 'transparent',
                  cursor: 'pointer', transition: 'all 150ms',
                }}>
                  {c.emoji} {c.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">認識情境</label>
            <input value={form.context} onChange={(e) => set('context', e.target.value)} className="input" placeholder="在哪裡認識？做什麼的？" />
          </div>
          <div>
            <label className="label">平台 / 聯絡方式</label>
            <input value={form.platform} onChange={(e) => set('platform', e.target.value)} className="input" placeholder="LinkedIn、IG、Email…" />
          </div>
          <div>
            <label className="label">下次追蹤日期</label>
            <input type="date" value={form.followUpDate} onChange={(e) => set('followUpDate', e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">備註</label>
            <textarea rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} className="textarea" placeholder="對方強項、共同話題、可合作方向…" />
          </div>
        </div>
        <div style={{ padding: '0 20px 20px', display: 'flex', gap: '8px' }}>
          <button onClick={() => { if (form.name.trim()) { onSave(form); onClose() } }} className="btn-primary" style={{ flex: 1 }}>
            儲存
          </button>
          <button onClick={onClose} className="btn-secondary">取消</button>
        </div>
      </div>
    </div>
  )
}

function ContactCard({ contact, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const cat = catMap[contact.category] || catMap.other
  const today = new Date().toISOString().split('T')[0]
  const isDue = contact.followUpDate && contact.followUpDate <= today

  return (
    <div className="card-hover" onClick={() => setExpanded(!expanded)}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: cat.bg, border: `1px solid ${cat.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '16px', flexShrink: 0,
        }}>
          {cat.emoji}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', fontWeight: 500, color: '#f0f0f4' }}>{contact.name}</span>
            <CategoryBadge category={contact.category} />
            {isDue && (
              <span style={{
                fontSize: '11px', padding: '2px 7px', borderRadius: '99px',
                background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)',
                color: '#f87171', display: 'flex', alignItems: 'center', gap: '3px',
              }}>
                <Bell size={9} /> 追蹤
              </span>
            )}
          </div>
          {contact.context && (
            <p style={{ fontSize: '11px', color: '#5e5e68', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {contact.context}
            </p>
          )}
          <p style={{ fontSize: '10px', color: '#3e3e48', marginTop: '2px' }}>
            {contact.createdAt} 加入
          </p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(contact.id) }}
          style={{ color: '#3e3e48', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '4px', transition: 'color 150ms' }}
          onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
          onMouseLeave={e => e.currentTarget.style.color = '#3e3e48'}
        >
          <Trash2 size={13} />
        </button>
      </div>

      {expanded && (contact.platform || contact.followUpDate || contact.notes) && (
        <div style={{
          marginTop: '12px', paddingTop: '10px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', flexDirection: 'column', gap: '5px',
        }}>
          {contact.platform && <p style={{ fontSize: '12px', color: '#909098' }}>🔗 {contact.platform}</p>}
          {contact.followUpDate && (
            <p style={{ fontSize: '12px', color: isDue ? '#f87171' : '#909098' }}>
              📅 追蹤日：{contact.followUpDate}
            </p>
          )}
          {contact.notes && <p style={{ fontSize: '12px', color: '#909098' }}>📝 {contact.notes}</p>}
        </div>
      )}
    </div>
  )
}

export default function NetworkPage() {
  const { contacts, addContact, deleteContact, getContactsDueFollowUp } = useStore()
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('all')

  const due = getContactsDueFollowUp()
  const filtered = contacts.filter((c) => {
    const matchSearch = !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.context?.toLowerCase().includes(search.toLowerCase())
    const matchCat = filterCat === 'all' || c.category === filterCat
    return matchSearch && matchCat
  })

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '24px 16px 40px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#f0f0f4', letterSpacing: '-0.02em' }}>
            人脈本
          </h1>
          <p style={{ fontSize: '12px', color: '#5e5e68', marginTop: '2px' }}>
            {contacts.length} 位聯絡人
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Plus size={13} /> 新增
        </button>
      </div>

      {due.length > 0 && (
        <div style={{
          background: 'rgba(248,113,113,0.07)',
          border: '1px solid rgba(248,113,113,0.2)',
          borderRadius: '10px', padding: '12px 14px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <Bell size={12} style={{ color: '#f87171' }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#f87171' }}>
              需要追蹤 ({due.length} 人)
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {due.map((c) => (
              <span key={c.id} style={{
                fontSize: '12px', color: '#fca5a5',
                background: 'rgba(248,113,113,0.1)', padding: '3px 8px', borderRadius: '99px',
              }}>
                {c.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <Search size={13} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#5e5e68' }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input"
          style={{ paddingLeft: '34px' }}
          placeholder="搜尋名字或情境…"
        />
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', paddingBottom: '2px' }}>
        {[{ value: 'all', label: '全部', emoji: '', accent: '#909098', bg: 'rgba(144,144,152,0.1)', border: 'rgba(144,144,152,0.2)' }, ...CATEGORIES].map((c) => (
          <button
            key={c.value}
            onClick={() => setFilterCat(c.value)}
            style={{
              flexShrink: 0, display: 'flex', alignItems: 'center', gap: '4px',
              padding: '4px 10px', borderRadius: '99px', fontSize: '12px',
              border: '1px solid',
              borderColor: filterCat === c.value ? c.border : 'rgba(255,255,255,0.07)',
              color: filterCat === c.value ? c.accent : '#5e5e68',
              background: filterCat === c.value ? c.bg : 'transparent',
              cursor: 'pointer', transition: 'all 150ms', whiteSpace: 'nowrap',
            }}
          >
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      {/* Contact list */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <User size={28} style={{ color: '#2e3033', margin: '0 auto 10px' }} />
          <p style={{ fontSize: '13px', color: '#5e5e68' }}>
            {contacts.length === 0 ? '還沒有聯絡人，開始認識新朋友吧' : '沒有符合條件的聯絡人'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.map((c) => (
            <ContactCard key={c.id} contact={c} onDelete={deleteContact} />
          ))}
        </div>
      )}

      {showModal && (
        <AddContactModal onClose={() => setShowModal(false)} onSave={addContact} />
      )}
    </div>
  )
}
