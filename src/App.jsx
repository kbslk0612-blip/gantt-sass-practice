import { useState } from 'react'
import './App.css'

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

const chartDates = [
  '2026-07-04',
  '2026-07-05',
  '2026-07-06',
  '2026-07-07',
  '2026-07-08',
  '2026-07-09',
  '2026-07-10',
  '2026-07-11',
  '2026-07-12',
  '2026-07-13',
  '2026-07-14',
  '2026-07-15',
]

function getDateIndex(date) {
  return chartDates.indexOf(date) + 1
}

function getTaskDuration(task) {
  const startIndex = getDateIndex(task.startDate)
  const endIndex = getDateIndex(task.endDate)

  return endIndex - startIndex + 1
}

function App() {
  const [tasks, setTasks] = useState(initialTasks)
  const [form, setForm] = useState({
    title: '',
    owner: '',
    startDate: '',
    endDate: '',
    status: '예정',
  })

  function handleChange(event) {
    const { name, value } = event.target

    setForm({
      ...form,
      [name]: value,
    })
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (!form.title || !form.owner || !form.startDate || !form.endDate) {
      alert('작업명, 담당자, 시작일, 종료일을 모두 입력해주세요.')
      return
    }

    const newTask = {
      id: Date.now(),
      ...form,
    }

    setTasks([...tasks, newTask])

    setForm({
      title: '',
      owner: '',
      startDate: '',
      endDate: '',
      status: '예정',
    })
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

          <button type="submit">작업 추가</button>
        </form>

        <h2>작업 목록</h2>

        <div className="task-list">
          {tasks.map((task) => (
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

              <span className="status">{task.status}</span>
            </article>
          ))}
        </div>

        <h2>간트차트</h2>

        <div className="gantt-chart">
          <div className="gantt-header">
            <div className="gantt-task-name">작업</div>

            {chartDates.map((date) => (
              <div className="gantt-date" key={date}>
                {date.slice(5)}
              </div>
            ))}
          </div>

          {tasks.map((task) => {
            const startIndex = getDateIndex(task.startDate)
            const duration = getTaskDuration(task)

            return (
              <div className="gantt-row" key={task.id}>
                <div className="gantt-task-name">{task.title}</div>

                <div className="gantt-timeline">
                  <div
                    className="gantt-bar"
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