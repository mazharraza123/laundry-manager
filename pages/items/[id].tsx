import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'

export default function ViewerItemPage() {
  const router = useRouter()
  const { id } = router.query
  const [item, setItem] = useState<any>(null)

  useEffect(() => {
    if (!id) return
    fetch(`/api/items/${id}`)
      .then(r => r.json())
      .then(setItem)
  }, [id])

  if (!item) return <div>Loading...</div>

  return (
    <div style={{ padding: 20 }}>
      <h1>Item {item.id}</h1>
      <p>{item.description}</p>
      <p>Current status: <strong>{item.currentStatus}</strong></p>
      <h3>Processes</h3>
      <ul>
        {item.processes.map((p: any) => (
          <li key={p.id}>
            {p.processType} — {p.startedAt ? new Date(p.startedAt).toLocaleString() : '-'} to {p.completedAt ? new Date(p.completedAt).toLocaleString() : '-'} — {p.notes}
          </li>
        ))}
      </ul>
    </div>
  )
}
