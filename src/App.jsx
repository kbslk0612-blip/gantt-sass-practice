import './App.css'

const sampleTasks = [
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

function App() {
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
        <h2>샘플 작업 목록</h2>

        <div className="task-list">
          {sampleTasks.map((task) => (
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
      </section>
    </main>
  )
}

export default App
