# Skill: Write Tests

Write tests for API changes in this project. Tests live in `api/src/app.test.ts` using vitest.

## Test structure

Tests use vitest with Prisma mocked via `vi.mock('./db.js')`. The app is tested through Hono's built-in `app.request()` — no HTTP server needed.

### Mock setup pattern

```ts
const prismaMock = {
  resource: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn()
  }
}

vi.mock('./db.js', () => ({ prisma: prismaMock }))
const { app } = await import('./app.js')
```

### Request helper

```ts
const request = (method: string, path: string, body?: unknown) => {
  const init: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' }
  }
  if (body) init.body = JSON.stringify(body)
  return app.request(path, init)
}
```

## What to test

For every endpoint, cover:

1. **Happy path** — correct status code and response shape
2. **Validation** — missing required fields, invalid types, out-of-range values
3. **Edge cases** — empty strings, boundary lengths, non-existent IDs (404)
4. **Prisma interaction** — verify the mock was called with the expected arguments

## Test checklist

- [ ] Each new or changed endpoint has at least one happy-path test
- [ ] Required field validation is tested (missing → 400)
- [ ] Enum/category fields reject invalid values (→ 400)
- [ ] Path params reject non-numeric or negative IDs (→ 400)
- [ ] 404 is returned when updating/fetching a non-existent resource
- [ ] The Prisma mock is asserted with `toHaveBeenCalledWith` for data-writing operations
- [ ] `beforeEach` calls `vi.clearAllMocks()`

## Naming convention

```ts
describe('METHOD /path', () => {
  it('does the expected thing', async () => { ... })
  it('rejects invalid input', async () => { ... })
  it('returns 404 for non-existent resource', async () => { ... })
})
```

## Running tests

```bash
npm run test --workspace api   # run once
npx vitest --workspace api     # watch mode
```

## Output

After writing tests, always run them and confirm they pass before committing.
