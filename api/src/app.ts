import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { cors } from 'hono/cors'
import { Prisma } from '@prisma/client'
import { prisma } from './db.js'

const RootResponseSchema = z.object({
  message: z.string(),
  openapi: z.string()
}).openapi('RootResponse')

const HealthResponseSchema = z.object({
  status: z.literal('ok')
}).openapi('HealthResponse')

const CategoryEnum = z.enum([
  'general',
  'room',
  'equipment',
  'vehicle',
  'workspace'
]).openapi('Category')

const ResourceSchema = z.object({
  id: z.number().int().openapi({ example: 1 }),
  title: z.string().min(1).max(120).openapi({ example: 'Conference Room A' }),
  description: z.string().max(500).openapi({ example: 'Large meeting room on floor 3' }),
  category: CategoryEnum.openapi({ example: 'room' }),
  createdAt: z.string().datetime().openapi({ example: '2024-01-01T00:00:00.000Z' }),
  updatedAt: z.string().datetime().openapi({ example: '2024-01-01T00:00:00.000Z' })
}).openapi('Resource')

const ResourceListResponseSchema = z.object({
  resources: z.array(ResourceSchema)
}).openapi('ResourceListResponse')

const CreateResourceSchema = z.object({
  title: z.string().trim().min(1).max(120).openapi({ example: 'Conference Room A' }),
  description: z.string().trim().max(500).optional().openapi({ example: 'Large meeting room on floor 3' }),
  category: CategoryEnum.optional().openapi({ example: 'room' })
}).openapi('CreateResource')

const UpdateResourceSchema = z.object({
  title: z.string().trim().min(1).max(120).optional().openapi({ example: 'Conference Room B' }),
  description: z.string().trim().max(500).optional().openapi({ example: 'Updated description' }),
  category: CategoryEnum.optional().openapi({ example: 'equipment' })
}).openapi('UpdateResource')

const ResourceParamsSchema = z.object({
  id: z.coerce.number().int().positive().openapi({
    param: {
      name: 'id',
      in: 'path'
    },
    example: 1
  })
}).openapi('ResourceParams')

const rootRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['System'],
  responses: {
    200: {
      description: 'Basic API information',
      content: {
        'application/json': {
          schema: RootResponseSchema
        }
      }
    }
  }
})

const healthRoute = createRoute({
  method: 'get',
  path: '/health',
  tags: ['System'],
  responses: {
    200: {
      description: 'Health check',
      content: {
        'application/json': {
          schema: HealthResponseSchema
        }
      }
    }
  }
})

const ResourceQuerySchema = z.object({
  search: z.string().optional().openapi({
    param: {
      name: 'search',
      in: 'query'
    },
    example: 'conference'
  }),
  category: CategoryEnum.optional().openapi({
    param: {
      name: 'category',
      in: 'query'
    },
    example: 'room'
  })
}).openapi('ResourceQuery')

const listResourcesRoute = createRoute({
  method: 'get',
  path: '/resources',
  tags: ['Resources'],
  request: {
    query: ResourceQuerySchema
  },
  responses: {
    200: {
      description: 'List all resources, optionally filtered by search text and/or category',
      content: {
        'application/json': {
          schema: ResourceListResponseSchema
        }
      }
    }
  }
})

const createResourceRoute = createRoute({
  method: 'post',
  path: '/resources',
  tags: ['Resources'],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: CreateResourceSchema
        }
      }
    }
  },
  responses: {
    201: {
      description: 'Create a new resource',
      content: {
        'application/json': {
          schema: ResourceSchema
        }
      }
    }
  }
})

const updateResourceRoute = createRoute({
  method: 'put',
  path: '/resources/{id}',
  tags: ['Resources'],
  request: {
    params: ResourceParamsSchema,
    body: {
      required: true,
      content: {
        'application/json': {
          schema: UpdateResourceSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Update an existing resource',
      content: {
        'application/json': {
          schema: ResourceSchema
        }
      }
    },
    404: {
      description: 'Resource not found'
    }
  }
})

const deleteResourceRoute = createRoute({
  method: 'delete',
  path: '/resources/{id}',
  tags: ['Resources'],
  request: {
    params: ResourceParamsSchema
  },
  responses: {
    204: {
      description: 'Remove a resource'
    }
  }
})

// --- Reservation schemas ---

const ReservationSchema = z.object({
  id: z.number().int().openapi({ example: 1 }),
  resourceId: z.number().int().openapi({ example: 1 }),
  bookedBy: z.string().min(1).max(120).openapi({ example: 'Alice' }),
  startTime: z.string().datetime().openapi({ example: '2025-06-01T09:00:00.000Z' }),
  endTime: z.string().datetime().openapi({ example: '2025-06-01T10:00:00.000Z' }),
  createdAt: z.string().datetime().openapi({ example: '2024-01-01T00:00:00.000Z' })
}).openapi('Reservation')

const ReservationListResponseSchema = z.object({
  reservations: z.array(ReservationSchema)
}).openapi('ReservationListResponse')

const CreateReservationSchema = z.object({
  bookedBy: z.string().trim().min(1).max(120).openapi({ example: 'Alice' }),
  startTime: z.string().datetime().openapi({ example: '2025-06-01T09:00:00.000Z' }),
  endTime: z.string().datetime().openapi({ example: '2025-06-01T10:00:00.000Z' })
}).openapi('CreateReservation')

const ReservationParamsSchema = z.object({
  id: z.coerce.number().int().positive().openapi({
    param: { name: 'id', in: 'path' },
    example: 1
  })
}).openapi('ReservationParams')

// --- Reservation routes ---

const listReservationsRoute = createRoute({
  method: 'get',
  path: '/resources/{id}/reservations',
  tags: ['Reservations'],
  request: {
    params: ResourceParamsSchema
  },
  responses: {
    200: {
      description: 'List all reservations for a resource',
      content: { 'application/json': { schema: ReservationListResponseSchema } }
    },
    404: { description: 'Resource not found' }
  }
})

const createReservationRoute = createRoute({
  method: 'post',
  path: '/resources/{id}/reservations',
  tags: ['Reservations'],
  request: {
    params: ResourceParamsSchema,
    body: {
      required: true,
      content: { 'application/json': { schema: CreateReservationSchema } }
    }
  },
  responses: {
    201: {
      description: 'Reservation created',
      content: { 'application/json': { schema: ReservationSchema } }
    },
    404: { description: 'Resource not found' },
    409: { description: 'Overlapping reservation exists' },
    422: { description: 'Validation error (duration too short or start time in the past)' }
  }
})

const deleteReservationRoute = createRoute({
  method: 'delete',
  path: '/reservations/{id}',
  tags: ['Reservations'],
  request: {
    params: ReservationParamsSchema
  },
  responses: {
    204: { description: 'Reservation deleted' },
    404: { description: 'Reservation not found' }
  }
})

type CategoryValue = z.infer<typeof CategoryEnum>

const toResourceResponse = (resource: {
  id: number
  title: string
  description: string
  category: string
  createdAt: Date
  updatedAt: Date
}) => ({
  id: resource.id,
  title: resource.title,
  description: resource.description,
  category: resource.category as CategoryValue,
  createdAt: resource.createdAt.toISOString(),
  updatedAt: resource.updatedAt.toISOString()
})

const defaultCorsOrigins = ['http://localhost:4173', 'http://localhost:5173']
const configuredCorsOrigins = process.env.CORS_ORIGIN
  ?.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

export const openApiDocumentConfig = {
  openapi: '3.0.0',
  info: {
    title: 'Cyfor Workshop API',
    version: '1.0.0',
    description: 'Workshop starter API built with Hono, Prisma, and SQLite.'
  }
}

export const app = new OpenAPIHono()

app.use('*', cors({
  origin: configuredCorsOrigins?.length ? configuredCorsOrigins : defaultCorsOrigins
}))

app.doc('/openapi.json', openApiDocumentConfig)

app.openapi(rootRoute, (c) => {
  return c.json({
    message: 'Cyfor workshop API',
    openapi: '/openapi.json'
  }, 200)
})

app.openapi(healthRoute, (c) => {
  return c.json({
    status: 'ok'
  }, 200)
})

app.openapi(listResourcesRoute, async (c) => {
  const { search, category } = c.req.valid('query')

  const where: Prisma.ResourceWhereInput = {}

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } }
    ]
  }

  if (category) {
    where.category = category
  }

  const resources = await prisma.resource.findMany({
    where,
    orderBy: {
      createdAt: 'desc'
    }
  })

  return c.json({
    resources: resources.map(toResourceResponse)
  }, 200)
})

app.openapi(createResourceRoute, async (c) => {
  const { title, description, category } = c.req.valid('json')
  const resource = await prisma.resource.create({
    data: {
      title,
      description: description ?? '',
      category: category ?? 'general'
    }
  })

  return c.json(toResourceResponse(resource), 201)
})

app.openapi(updateResourceRoute, async (c) => {
  const { id } = c.req.valid('param')
  const data = c.req.valid('json')

  const existing = await prisma.resource.findUnique({ where: { id } })
  if (!existing) {
    return c.body(null, 404)
  }

  const resource = await prisma.resource.update({
    where: { id },
    data
  })

  return c.json(toResourceResponse(resource), 200)
})

app.openapi(deleteResourceRoute, async (c) => {
  const { id } = c.req.valid('param')

  await prisma.resource.deleteMany({
    where: {
      id
    }
  })

  return c.body(null, 204)
})

// --- Reservation helpers ---

const toReservationResponse = (r: {
  id: number
  resourceId: number
  bookedBy: string
  startTime: Date
  endTime: Date
  createdAt: Date
}) => ({
  id: r.id,
  resourceId: r.resourceId,
  bookedBy: r.bookedBy,
  startTime: r.startTime.toISOString(),
  endTime: r.endTime.toISOString(),
  createdAt: r.createdAt.toISOString()
})

const THIRTY_MINUTES_MS = 30 * 60 * 1000

// --- Reservation handlers ---

app.openapi(listReservationsRoute, async (c) => {
  const { id } = c.req.valid('param')

  const resource = await prisma.resource.findUnique({ where: { id } })
  if (!resource) {
    return c.body(null, 404)
  }

  const reservations = await prisma.reservation.findMany({
    where: { resourceId: id },
    orderBy: { startTime: 'asc' }
  })

  return c.json({
    reservations: reservations.map(toReservationResponse)
  }, 200)
})

app.openapi(createReservationRoute, async (c) => {
  const { id } = c.req.valid('param')
  const { bookedBy, startTime: startStr, endTime: endStr } = c.req.valid('json')

  const startTime = new Date(startStr)
  const endTime = new Date(endStr)

  // Validate: end must be after start
  if (endTime.getTime() <= startTime.getTime()) {
    return c.json({ error: 'endTime must be after startTime' }, 422)
  }

  // Validate: minimum 30 minutes
  if (endTime.getTime() - startTime.getTime() < THIRTY_MINUTES_MS) {
    return c.json({ error: 'Reservation must be at least 30 minutes' }, 422)
  }

  // Validate: start must be in the future
  if (startTime.getTime() <= Date.now()) {
    return c.json({ error: 'startTime must be in the future' }, 422)
  }

  // Check resource exists
  const resource = await prisma.resource.findUnique({ where: { id } })
  if (!resource) {
    return c.body(null, 404)
  }

  // Check for overlapping reservations (strict inequality — touching slots are OK)
  const overlap = await prisma.reservation.findFirst({
    where: {
      resourceId: id,
      startTime: { lt: endTime },
      endTime: { gt: startTime }
    }
  })

  if (overlap) {
    return c.json({ error: 'Overlapping reservation exists' }, 409)
  }

  const reservation = await prisma.reservation.create({
    data: {
      resourceId: id,
      bookedBy,
      startTime,
      endTime
    }
  })

  return c.json(toReservationResponse(reservation), 201)
})

app.openapi(deleteReservationRoute, async (c) => {
  const { id } = c.req.valid('param')

  const existing = await prisma.reservation.findUnique({ where: { id } })
  if (!existing) {
    return c.body(null, 404)
  }

  await prisma.reservation.delete({ where: { id } })

  return c.body(null, 204)
})

export type AppType = typeof app
