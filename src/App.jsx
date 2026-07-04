import { useEffect, useState } from 'react'
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

function App() {function getStatusClass(status) {
  if (status === '진행중') {
    return 'in-progress'
  }

  if (status === '완료') {
    return 'done'
  }

  return 'todo'
}
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('ganttTasks')

    if (savedTasks) {
      return JSON.parse(savedTasks)
    }

    return initialTasks
  })

  const [form, setForm] = useState({
    title: '',
    owner: '',
    startDate: '',
    endDate: '',
    status: '예정',
  })

  const chartDates = createDateRange(tasks)

  useEffect(() => {
    localStorage.setItem('ganttTasks', JSON.stringify(tasks))
  }, [tasks])

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

    if (new Date(form.startDate) > new Date(form.endDate)) {
      alert('종료일은 시작일보다 늦거나 같아야 합니다.')
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

  function handleDelete(taskId) {
    setTasks(tasks.filter((task) => task.id !== taskId))
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

              <span className={`status ${getStatusClass(task.status)}`}>{task.status}</span>

              <button className="delete-button" onClick={() => handleDelete(task.id)}>
                삭제
              </button>
            </article>
          ))}
        </div>

        <h2>간트차트</h2>

        <div className="gantt-chart" style={{ '--date-count': chartDates.length }}>
          <div className="gantt-header">
            <div className="gantt-task-name">작업</div>

            {chartDates.map((date) => (
              <div className="gantt-date" key={date}>
                {date.slice(5)}
              </div>
            ))}
          </div>

          {tasks.map((task) => {
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