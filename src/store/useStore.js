import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const todayStr = () => new Date().toISOString().split('T')[0]

const getWeekKey = () => {
  const d = new Date()
  const jan1 = new Date(d.getFullYear(), 0, 1)
  const week = Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7)
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`
}

const defaultPillars = () => ({
  learning: { done: false, minutes: 0, notes: '' },
  networking: { done: false, count: 0, notes: '' },
  deepWork: { done: false, minutes: 0, notes: '' },
  knowledge: { done: false, items: 0, notes: '' },
})

const emptyDayLog = (date) => ({
  date,
  energy: 5,
  focus: '',
  pillars: defaultPillars(),
  mood: 'neutral',
  reflection: '',
  completed: false,
})

export const useStore = create(
  persist(
    (set, get) => ({
      profile: {
        name: '征途者',
        birthYear: 2003,
        targetAge: 40,
        targetIncome: 25000000,
        field: '科技',
        currentPhase: 1,
      },

      dailyLogs: {},
      weeklyReviews: {},
      contacts: [],

      getTodayLog: () => {
        const { dailyLogs } = get()
        const d = todayStr()
        return dailyLogs[d] || emptyDayLog(d)
      },

      updateTodayLog: (updates) =>
        set((state) => {
          const d = todayStr()
          const existing = state.dailyLogs[d] || emptyDayLog(d)
          return {
            dailyLogs: {
              ...state.dailyLogs,
              [d]: { ...existing, ...updates },
            },
          }
        }),

      updatePillar: (pillarName, updates) =>
        set((state) => {
          const d = todayStr()
          const log = state.dailyLogs[d] || emptyDayLog(d)
          return {
            dailyLogs: {
              ...state.dailyLogs,
              [d]: {
                ...log,
                pillars: {
                  ...log.pillars,
                  [pillarName]: { ...log.pillars[pillarName], ...updates },
                },
              },
            },
          }
        }),

      completeTodayLog: () =>
        set((state) => {
          const d = todayStr()
          const log = state.dailyLogs[d] || emptyDayLog(d)
          return {
            dailyLogs: {
              ...state.dailyLogs,
              [d]: { ...log, completed: true },
            },
          }
        }),

      addContact: (contact) =>
        set((state) => ({
          contacts: [
            ...state.contacts,
            { ...contact, id: Date.now().toString(), createdAt: todayStr() },
          ],
        })),

      updateContact: (id, updates) =>
        set((state) => ({
          contacts: state.contacts.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),

      deleteContact: (id) =>
        set((state) => ({
          contacts: state.contacts.filter((c) => c.id !== id),
        })),

      saveWeeklyReview: (review) =>
        set((state) => ({
          weeklyReviews: {
            ...state.weeklyReviews,
            [getWeekKey()]: { ...review, weekKey: getWeekKey() },
          },
        })),

      getCurrentWeekReview: () => {
        const { weeklyReviews } = get()
        return weeklyReviews[getWeekKey()] || null
      },

      updateProfile: (updates) =>
        set((state) => ({
          profile: { ...state.profile, ...updates },
        })),

      // ── Goal Tree ────────────────────────────────────────
      // goals: { [id]: GoalNode }
      // GoalNode: { id, parentId, title, level, pillar, done, notes, createdAt }
      goals: {},
      goalRoots: [], // IDs of top-level theme nodes

      addGoalNode: (parentId, title) =>
        set((state) => {
          const id = Date.now().toString()
          const level = parentId === null
            ? 0
            : (state.goals[parentId]?.level ?? 0) + 1
          const node = {
            id,
            parentId,
            title,
            level,          // 0=主題 1=目標 2=里程碑 3=任務 4=今日行動
            pillar: null,
            done: false,
            notes: '',
            createdAt: todayStr(),
          }
          return {
            goals: { ...state.goals, [id]: node },
            goalRoots: parentId === null
              ? [...state.goalRoots, id]
              : state.goalRoots,
          }
        }),

      updateGoalNode: (id, updates) =>
        set((state) => ({
          goals: {
            ...state.goals,
            [id]: { ...state.goals[id], ...updates },
          },
        })),

      deleteGoalNode: (id) =>
        set((state) => {
          // Collect all descendant IDs recursively
          const toDelete = new Set()
          const collect = (nodeId) => {
            toDelete.add(nodeId)
            Object.values(state.goals).forEach((n) => {
              if (n.parentId === nodeId) collect(n.id)
            })
          }
          collect(id)
          const newGoals = { ...state.goals }
          toDelete.forEach((nid) => delete newGoals[nid])
          return {
            goals: newGoals,
            goalRoots: state.goalRoots.filter((rid) => !toDelete.has(rid)),
          }
        }),

      getGoalChildren: (parentId) => {
        const { goals } = get()
        return Object.values(goals)
          .filter((n) => n.parentId === parentId)
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      },

      getStreak: () => {
        const { dailyLogs } = get()
        let streak = 0
        const d = new Date()
        for (let i = 0; i < 365; i++) {
          const dateStr = d.toISOString().split('T')[0]
          const log = dailyLogs[dateStr]
          if (log && log.completed) {
            streak++
          } else if (i === 0) {
            // today not completed yet — check if any pillars done
            if (log) {
              const p = log.pillars
              const anyDone = p.learning.done || p.networking.done || p.deepWork.done || p.knowledge.done
              if (!anyDone) {
                d.setDate(d.getDate() - 1)
                continue
              }
            }
          } else {
            break
          }
          d.setDate(d.getDate() - 1)
        }
        return streak
      },

      getLast7Days: () => {
        const { dailyLogs } = get()
        const result = []
        for (let i = 6; i >= 0; i--) {
          const d = new Date()
          d.setDate(d.getDate() - i)
          const dateStr = d.toISOString().split('T')[0]
          const log = dailyLogs[dateStr]
          const dayNames = ['日', '一', '二', '三', '四', '五', '六']
          const p = log?.pillars || defaultPillars()
          const score =
            (p.learning.done ? 25 : 0) +
            (p.networking.done ? 25 : 0) +
            (p.deepWork.done ? 25 : 0) +
            (p.knowledge.done ? 25 : 0)
          result.push({
            day: `週${dayNames[d.getDay()]}`,
            date: dateStr,
            score,
            energy: log?.energy || 0,
            learning: p.learning.done ? 1 : 0,
            networking: p.networking.done ? 1 : 0,
            deepWork: p.deepWork.done ? 1 : 0,
            knowledge: p.knowledge.done ? 1 : 0,
          })
        }
        return result
      },

      getTotalDaysLogged: () => {
        const { dailyLogs } = get()
        return Object.values(dailyLogs).filter((l) => l.completed).length
      },

      getContactsDueFollowUp: () => {
        const { contacts } = get()
        const today = todayStr()
        return contacts.filter((c) => c.followUpDate && c.followUpDate <= today)
      },
    }),
    {
      name: 'self-growth-2040',
      version: 1,
    }
  )
)

export const PILLARS = {
  learning: {
    key: 'learning',
    label: '學習成長',
    emoji: '📚',
    color: 'blue',
    desc: '課程、技能、閱讀',
    unit: '分鐘',
    field: 'minutes',
  },
  networking: {
    key: 'networking',
    label: '人脈經營',
    emoji: '🤝',
    color: 'purple',
    desc: '認識新人、維繫關係',
    unit: '次互動',
    field: 'count',
  },
  deepWork: {
    key: 'deepWork',
    label: '深度工作',
    emoji: '🎯',
    color: 'amber',
    desc: '專注無干擾的高品質工作',
    unit: '分鐘',
    field: 'minutes',
  },
  knowledge: {
    key: 'knowledge',
    label: '知識輸入',
    emoji: '💡',
    color: 'emerald',
    desc: 'Podcast、文章、影片',
    unit: '則',
    field: 'items',
  },
}

export const PILLAR_COLORS = {
  blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/40', text: 'text-blue-400', ring: 'ring-blue-500' },
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/40', text: 'text-purple-400', ring: 'ring-purple-500' },
  amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/40', text: 'text-amber-400', ring: 'ring-amber-500' },
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/40', text: 'text-emerald-400', ring: 'ring-emerald-500' },
}
