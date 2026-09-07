import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'

const STATUSES = ['NEW','DYEING','WASHING','CREATION','QC','READY','DELIVERED']

export default function AdminItemPage() {
  const router = useRouter()
  const { id } = router.query
  const [item, setItem] = useState<any>(null)
  const [status, setStatus] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!id) return
    fetch(`/api/items/${id}`)
      .then(r => r.json())
      .then(setItem)
  }, [id])

  useEffect(() => {
    if (item) setStatus(item.currentStatus)
  }, [item])

  async function updateStatus() {
    setLoading(true)
    setMessage('')
    const res = await fetch(`/api/items/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'admin' // simple auth for now
      },
      body: JSON.stringify({ status, note })
    })
    const data = await res.json()
    if (res.ok) {
      setItem(data.item)
      setMessage('Status updated')
    } else {
      setMessage(data.error || 'Error')
    }
    setLoading(false)
  }

  if (!item) return <div>Loading...</div>

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin — Item {item.id}</h1>
      <p>{item.description}</p>
      <div>
        <label>Current status: <strong>{item.currentStatus}</strong></label>
      </div>
      <div style={{ marginTop: 10 }}>
        <select value={status} onChange={e => setStatus(e.target.value)}>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div style={{ marginTop: 8 }}>
        <textarea placeholder="Note (optional)" value={note} onChange={e => setNote(e.target.value)} />
      </div>
      <div style={{ marginTop: 8 }}>
        <button onClick={updateStatus} disabled={loading}>Update Status</button>
      </div>
      {message && <div style={{ marginTop: 8 }}>{message}</div>}

      <h3 style={{ marginTop: 20 }}>Processes</h3>
      <ul>
        {item.processes.map((p: any) => (
          <li key={p.id}>
            {p.processType} — started: {p.startedAt ? new Date(p.startedAt).toLocaleString() : '-'} — completed: {p.completedAt ? new Date(p.completedAt).toLocaleString() : '-'} — notes: {p.notes}
          </li>
        ))}
      </ul>
    </div>
  )
}
