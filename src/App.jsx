import { useEffect, useState } from 'react'
import './App.css'
import { supabase } from './supabaseClient'

const initialTasks = [
  {
    id: 1,
    title: '기획 정리',
    owner: '범수',
    startDate: '2026-07-04',
    endDate: '2026-07-06',
    status: '진행중',
  },
  {
    id: 2,
    title: '디자인 초안',
    owner: '지민',
    startDate: '2026-07-07',
    endDate: '2026-07-10',
    status: '예정',
  },
  {
    id: 3,
    title: 'MVP 개발',
    owner: '범수',
    startDate: '2026-07-11',
    endDate: '2026-07-15',
    status: '예정',
  },
]

function formatDate(date) {
  return date.toISOString().slice(0, 10)
}

function createDateRange(tasks) {
  if (tasks.length === 0) {
    return []
  }

  const startDates = tasks.map((task) => new Date(task.startDate))
  const endDates = tasks.map((task) => new Date(task.endDate))

  const minDate = new Date(Math.min(...startDates))
  const maxDate = new Date(Math.max(...endDates))

  const dates = []
  const currentDate = new Date(minDate)

  while (currentDate <= maxDate) {
    dates.push(formatDate(currentDate))
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return dates
}

function getDateIndex(date, chartDates) {
  return chartDates.indexOf(date) + 1
}

function getTaskDuration(task, chartDates) {
  const startIndex = getDateIndex(task.startDate, chartDates)
  const endIndex = getDateIndex(task.endDate, chartDates)

  return endIndex - startIndex + 1
}

function getStatusClass(status) {
  if (status === '진행중') {
    return 'in-progress'
  }

  if (status === '완료') {
    return 'done'
  }

  return 'todo'
}

function App() {
  const [tasks, setTasks] = useState([])
const [isLoading, setIsLoading] = useState(false)

  const [form, setForm] = useState({
    title: '',
    owner: '',
    startDate: '',
    endDate: '',
    status: '예정',
  })

  const [editingTaskId, setEditingTaskId] = useState(null)
  const [statusFilter, setStatusFilter] = useState('전체')
  const [searchText, setSearchText] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('전체')
  const [sortOption, setSortOption] = useState('기본순')
  const [ownerFilter, setOwnerFilter] = useState('전체 담당자')
  const availableMonths = [
  '전체',
  ...new Set(tasks.map((task) => task.startDate.slice(0, 7))),
]
const availableOwners = [
  '전체 담당자',
  ...new Set(tasks.map((task) => task.owner)),
]
const filteredTasks = tasks.filter((task) => {
  const lowerSearchText = searchText.toLowerCase()

  const matchesStatus = statusFilter === '전체' || task.status === statusFilter
  const matchesOwner =
    ownerFilter === '전체 담당자' || task.owner === ownerFilter
  const matchesSearch =
    task.title.toLowerCase().includes(lowerSearchText) ||
    task.owner.toLowerCase().includes(lowerSearchText)

  return matchesStatus && matchesOwner && matchesSearch
})
const sortedTasks = [...filteredTasks].sort((a, b) => {
  if (sortOption === '시작일 빠른순') {
    return new Date(a.startDate) - new Date(b.startDate)
  }

  if (sortOption === '종료일 빠른순') {
    return new Date(a.endDate) - new Date(b.endDate)
  }

  return 0
})
const chartTasks =
  selectedMonth === '전체'
    ? sortedTasks
    : sortedTasks.filter((task) => task.startDate.startsWith(selectedMonth))
 const chartDates = createDateRange(chartTasks)

const totalTaskCount = tasks.length
const todoTaskCount = tasks.filter((task) => task.status === '예정').length
const inProgressTaskCount = tasks.filter((task) => task.status === '진행중').length
const doneTaskCount = tasks.filter((task) => task.status === '완료').length

useEffect(() => {
  fetchTasks()
}, [])

async function fetchTasks() {
  setIsLoading(true)

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    alert('작업을 불러오는 중 문제가 발생했습니다.')
    console.error(error)
    setIsLoading(false)
    return
  }

  const formattedTasks = data.map((task) => ({
    id: task.id,
    title: task.title,
    owner: task.owner,
    startDate: task.start_date,
    endDate: task.end_date,
    status: task.status,
  }))

  setTasks(formattedTasks)
  setIsLoading(false)
}

  function handleChange(event) {
    const { name, value } = event.target

    setForm({
      ...form,
      [name]: value,
    })
  }

  function resetForm() {
    setForm({
      title: '',
      owner: '',
      startDate: '',
      endDate: '',
      status: '예정',
    })
  }

  async function handleSubmit(event) {
  event.preventDefault()

  if (!form.title || !form.owner || !form.startDate || !form.endDate) {
    alert('작업명, 담당자, 시작일, 종료일을 모두 입력해주세요.')
    return
  }

  if (new Date(form.startDate) > new Date(form.endDate)) {
    alert('종료일은 시작일보다 늦거나 같아야 합니다.')
    return
  }

  const startYear = Number(form.startDate.slice(0, 4))
  const endYear = Number(form.endDate.slice(0, 4))

  if (
    startYear < 2020 ||
    startYear > 2035 ||
    endYear < 2020 ||
    endYear > 2035
  ) {
    alert('날짜는 2020년부터 2035년 사이로 입력해주세요.')
    return
  }

  if (editingTaskId !== null) {
    setTasks(
      tasks.map((task) =>
        task.id === editingTaskId ? { ...task, ...form } : task
      )
    )

    setEditingTaskId(null)
  } else {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: form.title,
        owner: form.owner,
        start_date: form.startDate,
        end_date: form.endDate,
        status: form.status,
      })
      .select()
      .single()

    if (error) {
      alert('작업을 저장하는 중 문제가 발생했습니다.')
      console.error(error)
      return
    }

    const newTask = {
      id: data.id,
      title: data.title,
      owner: data.owner,
      startDate: data.start_date,
      endDate: data.end_date,
      status: data.status,
    }

    setTasks([...tasks, newTask])
  }

  resetForm()
}
  function handleDelete(taskId) {
    setTasks(tasks.filter((task) => task.id !== taskId))
  }

  function handleResetTasks() {
    setTasks(initialTasks)
    setEditingTaskId(null)
    resetForm()
  }

  function handleEdit(task) {
    setEditingTaskId(task.id)

    setForm({
      title: task.title,
      owner: task.owner,
      startDate: task.startDate,
      endDate: task.endDate,
      status: task.status,
    })
  }

  function handleCancelEdit() {
    setEditingTaskId(null)
    resetForm()
  }
  function handleResetFilters() {
  setSearchText('')
  setStatusFilter('전체')
  setSortOption('기본순')
  setOwnerFilter('전체 담당자')
  setSelectedMonth('전체')
}

  return (
    <main className="app">
      <section className="hero">
        <p className="eyebrow">Gantt SaaS Practice</p>
        <h1>간트차트 MVP</h1>
        <p className="description">
          프로젝트 작업, 담당자, 일정, 상태를 한눈에 보는 연습용 SaaS입니다.
        </p>
      </section>

      <section className="task-section">
        <div className="summary-grid">
  <div className="summary-card">
    <span>전체 작업</span>
    <strong>{totalTaskCount}</strong>
  </div>

  <div className="summary-card">
    <span>예정</span>
    <strong>{todoTaskCount}</strong>
  </div>

  <div className="summary-card">
    <span>진행중</span>
    <strong>{inProgressTaskCount}</strong>
  </div>

  <div className="summary-card">
    <span>완료</span>
    <strong>{doneTaskCount}</strong>
  </div>
</div>
        <h2>작업 추가</h2>

        <form className="task-form" onSubmit={handleSubmit}>
          <label>
            작업명
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="예: 디자인 검토"
            />
          </label>

          <label>
            담당자
            <input
              name="owner"
              value={form.owner}
              onChange={handleChange}
              placeholder="예: 범수"
            />
          </label>

          <label>
            시작일
            <input
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
            />
          </label>

          <label>
            종료일
            <input
              type="date"
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
            />
          </label>

          <label>
            상태
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="예정">예정</option>
              <option value="진행중">진행중</option>
              <option value="완료">완료</option>
            </select>
          </label>

          <div className="form-actions">
            <button type="submit">
              {editingTaskId ? '작업 수정' : '작업 추가'}
            </button>

            {editingTaskId && (
              <button
                type="button"
                className="cancel-button"
                onClick={handleCancelEdit}
              >
                수정 취소
              </button>
            )}
          </div>
        </form>

        <div className="section-header">
          <h2>작업 목록</h2>
          <div className="search-box">
  <input
    value={searchText}
    onChange={(event) => setSearchText(event.target.value)}
    placeholder="작업명 또는 담당자로 검색"
  />
</div>

          <div className="filter-buttons">
  {['전체', '예정', '진행중', '완료'].map((status) => (
    <button
      key={status}
      className={statusFilter === status ? 'filter-button active' : 'filter-button'}
      onClick={() => setStatusFilter(status)}
    >
      {status}
    </button>
  ))}
</div>
<div className="sort-buttons">
  {['기본순', '시작일 빠른순', '종료일 빠른순'].map((option) => (
    <button
      key={option}
      className={sortOption === option ? 'sort-button active' : 'sort-button'}
      onClick={() => setSortOption(option)}
    >
      {option}
    </button>
  ))}
</div>
<div className="owner-buttons">
  {availableOwners.map((owner) => (
    <button
      key={owner}
      className={ownerFilter === owner ? 'owner-button active' : 'owner-button'}
      onClick={() => setOwnerFilter(owner)}
    >
      {owner}
    </button>
  ))}
</div>
<button className="clear-filter-button" onClick={handleResetFilters}>
  필터 초기화
</button>

          <button className="reset-button" onClick={handleResetTasks}>
            기본 작업으로 초기화
          </button>
        </div>
{isLoading && <div className="empty-message">작업을 불러오는 중입니다.</div>}
        <div className="task-list">
          {filteredTasks.length === 0 ? (
    <div className="empty-message">
      조건에 맞는 작업이 없습니다.
    </div>
  ) : (
   sortedTasks.map((task) => (
      <article className="task-card" key={task.id}>
              <div>
                <h3>{task.title}</h3>
                <p>{task.owner}</p>
              </div>

              <div className="task-meta">
                <span>{task.startDate}</span>
                <span>~</span>
                <span>{task.endDate}</span>
              </div>

              <span className={`status ${getStatusClass(task.status)}`}>
                {task.status}
              </span>

              <button className="edit-button" onClick={() => handleEdit(task)}>
                수정
              </button>

              <button
                className="delete-button"
                onClick={() => handleDelete(task.id)}
              >
                삭제
              </button>
            </article>
          ))
  )}
        </div>

        <h2>간트차트</h2>
<div className="month-buttons">
  {availableMonths.map((month) => (
    <button
      key={month}
      className={selectedMonth === month ? 'month-button active' : 'month-button'}
      onClick={() => setSelectedMonth(month)}
    >
      {month}
    </button>
  ))}
</div>
        <div className="gantt-chart" style={{ '--date-count': chartDates.length }}>
          <div className="gantt-header">
            <div className="gantt-task-name">작업</div>

            {chartDates.map((date) => (
              <div className="gantt-date" key={date}>
                {date.slice(5)}
              </div>
            ))}
          </div>

          {chartTasks.map((task) => {
            const startIndex = getDateIndex(task.startDate, chartDates)
            const duration = getTaskDuration(task, chartDates)

            return (
              <div className="gantt-row" key={task.id}>
                <div className="gantt-task-name">{task.title}</div>

                <div className="gantt-timeline">
                  <div
                    className={`gantt-bar ${getStatusClass(task.status)}`}
                    style={{
                      gridColumn: `${startIndex} / span ${duration}`,
                    }}
                  >
                    {task.status}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </main>
  )
}

export default App