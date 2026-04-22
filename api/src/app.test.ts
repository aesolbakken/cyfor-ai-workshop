import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockResource = {
  id: 1,
  title: 'Conference Room A',
  description: 'Large meeting room',
  category: 'room',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z')
}

const prismaMock = {
  resource: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn()
  }
}

vi.mock('./db.js', () => ({
  prisma: prismaMock
}))

// Import app after mock is set up
const { app } = await import('./app.js')

const request = (method: string, path: string, body?: unknown) => {
  const init: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' }
  }
  if (body) init.body = JSON.stringify(body)
  return app.request(path, init)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('system routes', () => {
  it('GET / returns API info', async () => {
    const res = await app.request('/')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({
      message: 'Cyfor workshop API',
      openapi: '/openapi.json'
    })
  })

  it('GET /health returns ok', async () => {
    const res = await app.request('/health')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ status: 'ok' })
  })

  it('GET /openapi.json returns the OpenAPI spec', async () => {
    const res = await app.request('/openapi.json')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.openapi).toBe('3.0.0')
    expect(body.info.title).toBe('Cyfor Workshop API')
  })
})

describe('GET /resources', () => {
  it('returns an empty list', async () => {
    prismaMock.resource.findMany.mockResolvedValue([])

    const res = await request('GET', '/resources')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ resources: [] })

    expect(prismaMock.resource.findMany).toHaveBeenCalledWith({
      where: {},
      orderBy: { createdAt: 'desc' }
    })
  })

  it('returns resources with all fields', async () => {
    prismaMock.resource.findMany.mockResolvedValue([mockResource])

    const res = await request('GET', '/resources')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.resources).toHaveLength(1)
    expect(body.resources[0]).toEqual({
      id: 1,
      title: 'Conference Room A',
      description: 'Large meeting room',
      category: 'room',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    })
  })

  it('passes search param to prisma query', async () => {
    prismaMock.resource.findMany.mockResolvedValue([])

    const res = await request('GET', '/resources?search=conference')
    expect(res.status).toBe(200)

    expect(prismaMock.resource.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [
            { title: { contains: 'conference' } },
            { description: { contains: 'conference' } }
          ]
        })
      })
    )
  })

  it('passes category filter to prisma query', async () => {
    prismaMock.resource.findMany.mockResolvedValue([])

    const res = await request('GET', '/resources?category=room')
    expect(res.status).toBe(200)

    expect(prismaMock.resource.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          category: 'room'
        })
      })
    )
  })

  it('combines search and category filters', async () => {
    prismaMock.resource.findMany.mockResolvedValue([])

    const res = await request('GET', '/resources?search=large&category=room')
    expect(res.status).toBe(200)

    expect(prismaMock.resource.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [
            { title: { contains: 'large' } },
            { description: { contains: 'large' } }
          ],
          category: 'room'
        })
      })
    )
  })

  it('rejects invalid category filter', async () => {
    const res = await request('GET', '/resources?category=bogus')
    expect(res.status).toBe(400)
  })
})

describe('POST /resources', () => {
  it('creates a resource with all fields', async () => {
    prismaMock.resource.create.mockResolvedValue(mockResource)

    const res = await request('POST', '/resources', {
      title: 'Conference Room A',
      description: 'Large meeting room',
      category: 'room'
    })
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.title).toBe('Conference Room A')
    expect(body.description).toBe('Large meeting room')
    expect(body.category).toBe('room')

    expect(prismaMock.resource.create).toHaveBeenCalledWith({
      data: {
        title: 'Conference Room A',
        description: 'Large meeting room',
        category: 'room'
      }
    })
  })

  it('creates a resource with only title (defaults applied)', async () => {
    const defaultResource = {
      ...mockResource,
      description: '',
      category: 'general'
    }
    prismaMock.resource.create.mockResolvedValue(defaultResource)

    const res = await request('POST', '/resources', {
      title: 'Simple Resource'
    })
    expect(res.status).toBe(201)

    expect(prismaMock.resource.create).toHaveBeenCalledWith({
      data: {
        title: 'Simple Resource',
        description: '',
        category: 'general'
      }
    })
  })

  it('rejects an empty title', async () => {
    const res = await request('POST', '/resources', { title: '' })
    expect(res.status).toBe(400)
  })

  it('rejects a missing title', async () => {
    const res = await request('POST', '/resources', { description: 'no title' })
    expect(res.status).toBe(400)
  })

  it('rejects an invalid category', async () => {
    const res = await request('POST', '/resources', {
      title: 'Test',
      category: 'invalid'
    })
    expect(res.status).toBe(400)
  })
})

describe('PUT /resources/:id', () => {
  it('updates a resource', async () => {
    const updated = { ...mockResource, title: 'Updated Room' }
    prismaMock.resource.findUnique.mockResolvedValue(mockResource)
    prismaMock.resource.update.mockResolvedValue(updated)

    const res = await request('PUT', '/resources/1', {
      title: 'Updated Room'
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.title).toBe('Updated Room')

    expect(prismaMock.resource.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { title: 'Updated Room' }
    })
  })

  it('updates only description', async () => {
    const updated = { ...mockResource, description: 'New description' }
    prismaMock.resource.findUnique.mockResolvedValue(mockResource)
    prismaMock.resource.update.mockResolvedValue(updated)

    const res = await request('PUT', '/resources/1', {
      description: 'New description'
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.description).toBe('New description')
  })

  it('updates category', async () => {
    const updated = { ...mockResource, category: 'equipment' }
    prismaMock.resource.findUnique.mockResolvedValue(mockResource)
    prismaMock.resource.update.mockResolvedValue(updated)

    const res = await request('PUT', '/resources/1', {
      category: 'equipment'
    })
    expect(res.status).toBe(200)
    expect((await res.json()).category).toBe('equipment')
  })

  it('rejects invalid category on update', async () => {
    const res = await request('PUT', '/resources/1', {
      category: 'bogus'
    })
    expect(res.status).toBe(400)
  })

  it('rejects invalid id', async () => {
    const res = await request('PUT', '/resources/abc', {
      title: 'Test'
    })
    expect(res.status).toBe(400)
  })

  it('returns 404 for non-existent resource', async () => {
    prismaMock.resource.findUnique.mockResolvedValue(null)

    const res = await request('PUT', '/resources/999', {
      title: 'Ghost'
    })
    expect(res.status).toBe(404)
    expect(prismaMock.resource.update).not.toHaveBeenCalled()
  })
})

describe('DELETE /resources/:id', () => {
  it('deletes a resource and returns 204', async () => {
    prismaMock.resource.deleteMany.mockResolvedValue({ count: 1 })

    const res = await request('DELETE', '/resources/1')
    expect(res.status).toBe(204)

    expect(prismaMock.resource.deleteMany).toHaveBeenCalledWith({
      where: { id: 1 }
    })
  })

  it('returns 204 even if resource does not exist', async () => {
    prismaMock.resource.deleteMany.mockResolvedValue({ count: 0 })

    const res = await request('DELETE', '/resources/999')
    expect(res.status).toBe(204)
  })

  it('rejects invalid id', async () => {
    const res = await request('DELETE', '/resources/abc')
    expect(res.status).toBe(400)
  })
})
