# sybra-testbed

A deliberately tiny Express app whose only purpose is to be a **manual-testing
target for Sybra's adversarial testing phase**. Sybra registers this repo as a
project, gets a task to add or change an endpoint, and its `test-runner` agent
starts this real app and tries to prove the change does **not** match the spec
below.

## Run it

```bash
npm install
npm start            # PORT=3000 by default
PORT=8123 npm start  # any port (the test-runner binds an ephemeral one)
curl localhost:3000/healthz   # -> ok
```

No database, no build step, no framework beyond Express — so a headless agent
can boot it in seconds on any free port.

## Endpoints

### Present on `main`
- `GET /` → `200`, `text/plain`, body `sybra-testbed ok`
- `GET /healthz` → `200`, `text/plain`, body `ok`

### Planned (NOT implemented on `main`)
These are the spec a Sybra task implements. The test-runner checks an
implementation against exactly this:

- `GET /health` → `200`, `application/json`, body `{"status":"ok"}`
- `GET /sum?a=<int>&b=<int>` → `200`, `application/json`, body `{"result":<a+b>}`;
  missing/non-integer params → `400` `{"error":"a and b must be integers"}`
- `GET /echo?msg=<string>` → `200`, `application/json`, body `{"echo":"<msg>"}`;
  missing `msg` → `400` `{"error":"msg is required"}`

## Demo scenarios

> Replace `owner/repo` with `Automaat/sybra-testbed` once this is pushed.

**0. Register the project** (one-time)

```bash
sybra-cli project create --url https://github.com/Automaat/sybra-testbed --type pet
```

**1. Full pipeline** — plan → implement → review → testing → PR

```bash
sybra-cli create --project Automaat/sybra-testbed \
  --title "Add GET /health JSON endpoint" \
  --body "Add GET /health returning 200 application/json {\"status\":\"ok\"} per README spec."
# then drive it from the GUI/board, or let the auto-pipeline run.
```

**2. Testing only, PASS** — hand off a branch that correctly implements the spec

```bash
git clone https://github.com/Automaat/sybra-testbed && cd sybra-testbed
git checkout -b feat/health
# implement GET /health correctly, commit
sybra-cli handoff --stage testing --project Automaat/sybra-testbed \
  --title "Add GET /health JSON endpoint" \
  --body "GET /health must return 200 application/json {\"status\":\"ok\"}."
# -> testing-task runs the test-runner against this worktree -> PASS -> ready-pr -> PR
```

**3. Testing only, FAIL** — hand off a branch whose code does NOT match the task

```bash
git checkout -b feat/health-broken
# implement GET /health returning the WRONG body (e.g. text "ok"), commit
sybra-cli handoff --stage testing --project Automaat/sybra-testbed \
  --title "Add GET /health JSON endpoint" \
  --body "GET /health must return 200 application/json {\"status\":\"ok\"}."
# -> test-runner proves it broken -> ## Test Failures on the task -> in-progress
#    (re-implement); after the attempt cap -> human-required
```

## Watching it

```bash
# server logs (and the test-runner's NDJSON streams under logs/agents/)
tail -f ~/.sybra/logs/sybra.log
sybra-cli get <task-id>          # status + verdict routing
```
