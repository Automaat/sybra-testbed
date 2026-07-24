const express = require('express')
const process = require('node:process')

const app = express()

// Baseline — always present on main so a trivial smoke test passes.
app.get('/', (_req, res) => {
  res.type('text/plain').send('sybra-testbed ok')
})

// Liveness — present on main.
app.get('/healthz', (_req, res) => {
  res.status(200).type('text/plain').send('ok')
})

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' })
})

app.get('/sum', (req, res) => {
  const a = Number(req.query.a)
  const b = Number(req.query.b)
  if (!Number.isInteger(a) || !Number.isInteger(b)) {
    return res.status(400).json({ error: 'a and b must be integers' })
  }
  res.status(200).json({ result: a + b })
})

app.get('/echo', (req, res) => {
  const msg = req.query.msg
  if (typeof msg !== 'string' || msg === '') {
    return res.status(400).json({ error: 'msg is required' })
  }
  res.status(200).json({ echo: msg })
})

const port = Number(process.env.PORT) || 3000
app.listen(port, () => {
  process.stdout.write(`sybra-testbed listening on http://localhost:${port}\n`)
})
