import { useState } from 'react'
import { Plus, User, Trash2, Bell, Search, Tag } from 'lucide-react'
import { useStore } from '../store/useStore'

const CATEGORIES = [
  { value: 'mentor', label: '導師', emoji: '🧭', color: 'text-gold-400 bg-gold-500/10 border-gold-500/30' },
  { value: 'peer', label: '同儕', emoji: '👥', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  { value: 'tech', label: '技術圈', emoji: '💻', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  { value: 'biz', label: '商業圈', emoji: '💼', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  { value: 'investor', label: '投資人', emoji: '📈', color: 'text-red-400 bg-red-500/10 border-red-500/30' },
  { value: 'other', label: '其他', emoji: '🔗', color: 'text-gray-400 bg-gray-500/10 border-gray-500/30' },
]

const catMap = Object.fromEntries(CATEGORIES.map((c) => [c.value, c]))

const emptyForm = () => ({
  name: '',
  category: 'peer',
  context: '',
  platform: '',
  followUpDate: '',
  notes: '',
})

function AddContactModal({ onClose, onSave }) {
  const [form, setForm] = useState(emptyForm())
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSave = () => {
    if (!form.name.trim()) return
    onSave(form)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
      <div className="bg-surface-800 border border-surface-600 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-surface-600 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-100">新增聯絡人</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-lg">×</button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="label">姓名 *</label>
            <input value={form.name} onChange={(e) => set('name', e.target.value)} className="input" placeholder="對方的名字" />
          </div>

          <div>
            <label className="label">關係類型</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => set('category', c.value)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs border transition-all ${
                    form.category === c.value ? c.color : 'border-surface-600 text-gray-500'
                  }`}
                >
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
            <label className="label">平台/聯絡方式</label>
            <input value={form.platform} onChange={(e) => set('platform', e.target.value)} className="input" placeholder="LinkedIn、IG、Email…" />
          </div>

          <div>
            <label className="label">下次追蹤日期</label>
            <input type="date" value={form.followUpDate} onChange={(e) => set('followUpDate', e.target.value)} className="input" />
          </div>

          <div>
            <label className="label">備註</label>
            <textarea rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} className="textarea" placeholder="對方的強項、共同話題、可合作方向…" />
          </div>
        </div>
        <div className="p-5 pt-0 flex gap-3">
          <button onClick={handleSave} className="flex-1 btn-primary">儲存</button>
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
    <div className="card-hover">
      <div className="flex items-start gap-3" onClick={() => setExpanded(!expanded)}>
        <div className="w-9 h-9 rounded-full bg-surface-600 flex items-center justify-center shrink-0 text-base">
          {cat.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-100">{contact.name}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${cat.color}`}>
              {cat.label}
            </span>
            {isDue && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-1">
                <Bell size={10} /> 追蹤
              </span>
            )}
          </div>
          {contact.context && (
            <p className="text-xs text-gray-500 mt-0.5 truncate">{contact.context}</p>
          )}
          <p className="text-xs text-gray-600 mt-0.5">{contact.createdAt} 加入</p>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onDelete(contact.id) }} className="text-gray-600 hover:text-red-400 transition-colors mt-0.5">
          <Trash2 size={14} />
        </button>
      </div>

      {expanded && (contact.platform || contact.followUpDate || contact.notes) && (
        <div className="mt-3 pt-3 border-t border-surface-600 text-xs space-y-1.5 text-gray-400">
          {contact.platform && <p>🔗 {contact.platform}</p>}
          {contact.followUpDate && (
            <p className={isDue ? 'text-red-400' : ''}>
              📅 追蹤日：{contact.followUpDate}
            </p>
          )}
          {contact.notes && <p>📝 {contact.notes}</p>}
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
    const matchSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.context?.toLowerCase().includes(search.toLowerCase())
    const matchCat = filterCat === 'all' || c.category === filterCat
    return matchSearch && matchCat
  })

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-100">人脈本</h1>
          <p className="text-sm text-gray-500">{contacts.length} 位聯絡人</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-1.5">
          <Plus size={14} /> 新增
        </button>
      </div>

      {due.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <Bell size={13} className="text-red-400" />
            <span className="text-xs font-semibold text-red-400">需要追蹤 ({due.length} 人)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {due.map((c) => (
              <span key={c.id} className="text-xs text-red-300 bg-red-500/10 px-2 py-1 rounded-full">
                {c.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Search + filter */}
      <div className="space-y-2">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9"
            placeholder="搜尋名字或情境…"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterCat('all')}
            className={`shrink-0 px-3 py-1 rounded-full text-xs border transition-all ${
              filterCat === 'all' ? 'bg-surface-600 border-gray-500 text-gray-200' : 'border-surface-600 text-gray-500'
            }`}
          >
            全部
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setFilterCat(c.value)}
              className={`shrink-0 flex items-center gap-1 px-3 py-1 rounded-full text-xs border transition-all ${
                filterCat === c.value ? c.color : 'border-surface-600 text-gray-500'
              }`}
            >
              {c.emoji} {c.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <User size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">
            {contacts.length === 0 ? '還沒有聯絡人，開始認識新朋友吧' : '沒有符合條件的聯絡人'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => (
            <ContactCard key={c.id} contact={c} onDelete={deleteContact} />
          ))}
        </div>
      )}

      {showModal && (
        <AddContactModal
          onClose={() => setShowModal(false)}
          onSave={addContact}
        />
      )}
    </div>
  )
}
