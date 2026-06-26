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

// The endpoints documented as "Planned" in README.md are intentionally NOT
// implemented on main. A Sybra task asks for one; the adversarial test-runner
// then starts this app and proves whether the implementation matches the spec.

const port = Number(process.env.PORT) || 3000
app.listen(port, () => {
  process.stdout.write(`sybra-testbed listening on http://localhost:${port}\n`)
})

// variant 4
