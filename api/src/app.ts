import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { cors } from 'hono/cors'
import { prisma } from './db.js'

const RootResponseSchema = z.object({
  message: z.string(),
  openapi: z.string()
}).openapi('RootResponse')

const HealthResponseSchema = z.object({
  status: z.literal('ok')
}).openapi('HealthResponse')

const ResourceSchema = z.object({
  id: z.number().int().openapi({ example: 1 }),
  title: z.string().min(1).max(120).openapi({ example: 'Conference room A' }),
  description: z.string().nullable().openapi({ example: 'Main building, 2nd floor' }),
  category: z.string().min(1).max(60).openapi({ example: 'Room' }),
  createdAt: z.string().datetime().openapi({ example: '2024-01-01T00:00:00.000Z' }),
  updatedAt: z.string().datetime().openapi({ example: '2024-01-01T00:00:00.000Z' })
}).openapi('Resource')

const ResourceListResponseSchema = z.object({
  resources: z.array(ResourceSchema)
}).openapi('ResourceListResponse')

const CreateResourceSchema = z.object({
  title: z.string().trim().min(1).max(120).openapi({ example: 'Conference room A' }),
  description: z.string().trim().max(500).optional().openapi({ example: 'Main building, 2nd floor' }),
  category: z.string().trim().min(1).max(60).openapi({ example: 'Room' })
}).openapi('CreateResource')

const UpdateResourceSchema = z.object({
  title: z.string().trim().min(1).max(120).optional().openapi({ example: 'Conference room B' }),
  description: z.string().trim().max(500).nullable().optional().openapi({ example: 'Updated description' }),
  category: z.string().trim().min(1).max(60).optional().openapi({ example: 'Equipment' })
}).openapi('UpdateResource')

const ReservationSchema = z.object({
  id: z.number().int().openapi({ example: 1 }),
  resourceId: z.number().int().openapi({ example: 1 }),
  reservedBy: z.string().openapi({ example: 'Ola Nordmann' }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).openapi({ example: '2026-04-24' }),
  startTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).openapi({ example: '09:00' }),
  endTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).openapi({ example: '11:00' }),
  createdAt: z.string().datetime().openapi({ example: '2024-01-01T00:00:00.000Z' }),
  updatedAt: z.string().datetime().openapi({ example: '2024-01-01T00:00:00.000Z' })
}).openapi('Reservation')

const ReservationListResponseSchema = z.object({
  reservations: z.array(ReservationSchema)
}).openapi('ReservationListResponse')

const CreateReservationSchema = z.object({
  reservedBy: z.string().trim().min(1).max(120).openapi({ example: 'Ola Nordmann' }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).openapi({ example: '2026-04-24' }),
  startTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).openapi({ example: '09:00' }),
  endTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).openapi({ example: '11:00' })
}).openapi('CreateReservation')

const ReservationParamsSchema = z.object({
  reservationId: z.coerce.number().int().positive().openapi({
    param: {
      name: 'reservationId',
      in: 'path'
    },
    example: 1
  })
}).openapi('ReservationParams')

const ResourceQuerySchema = z.object({
  search: z.string().optional().openapi({
    param: {
      name: 'search',
      in: 'query'
    },
    example: 'conference'
  })
}).openapi('ResourceQuery')

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

const listResourcesRoute = createRoute({
  method: 'get',
  path: '/resources',
  tags: ['Resources'],
  request: {
    query: ResourceQuerySchema
  },
  responses: {
    200: {
      description: 'List all resources',
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

const listReservationsRoute = createRoute({
  method: 'get',
  path: '/resources/{id}/reservations',
  tags: ['Reservations'],
  request: {
    params: ResourceParamsSchema
  },
  responses: {
    200: {
      description: 'List reservations for a resource',
      content: {
        'application/json': {
          schema: ReservationListResponseSchema
        }
      }
    },
    404: {
      description: 'Resource not found'
    }
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
      content: {
        'application/json': {
          schema: CreateReservationSchema
        }
      }
    }
  },
  responses: {
    201: {
      description: 'Create a reservation',
      content: {
        'application/json': {
          schema: ReservationSchema
        }
      }
    },
    404: {
      description: 'Resource not found'
    },
    409: {
      description: 'Time slot conflicts with an existing reservation'
    },
    400: {
      description: 'Validation error (e.g. startTime >= endTime)'
    }
  }
})

const deleteReservationRoute = createRoute({
  method: 'delete',
  path: '/resources/{id}/reservations/{reservationId}',
  tags: ['Reservations'],
  request: {
    params: ResourceParamsSchema.merge(ReservationParamsSchema)
  },
  responses: {
    204: {
      description: 'Delete a reservation'
    }
  }
})

const toReservationResponse = (reservation: {
  id: number
  resourceId: number
  reservedBy: string
  date: string
  startTime: string
  endTime: string
  createdAt: Date
  updatedAt: Date
}) => ({
  id: reservation.id,
  resourceId: reservation.resourceId,
  reservedBy: reservation.reservedBy,
  date: reservation.date,
  startTime: reservation.startTime,
  endTime: reservation.endTime,
  createdAt: reservation.createdAt.toISOString(),
  updatedAt: reservation.updatedAt.toISOString()
})

const toResourceResponse = (resource: {
  id: number
  title: string
  description: string | null
  category: string
  createdAt: Date
  updatedAt: Date
}) => ({
  id: resource.id,
  title: resource.title,
  description: resource.description,
  category: resource.category,
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
  const { search } = c.req.valid('query')

  const where = search
    ? {
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
          { category: { contains: search } }
        ]
      }
    : undefined

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
      description: description ?? null,
      category
    }
  })

  return c.json(toResourceResponse(resource), 201)
})

app.openapi(updateResourceRoute, async (c) => {
  const { id } = c.req.valid('param')
  const body = c.req.valid('json')

  const existing = await prisma.resource.findUnique({ where: { id } })
  if (!existing) {
    return c.body(null, 404)
  }

  const resource = await prisma.resource.update({
    where: { id },
    data: body
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

app.openapi(listReservationsRoute, async (c) => {
  const { id } = c.req.valid('param')

  const resource = await prisma.resource.findUnique({ where: { id } })
  if (!resource) {
    return c.body(null, 404)
  }

  const reservations = await prisma.reservation.findMany({
    where: { resourceId: id },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }]
  })

  return c.json({
    reservations: reservations.map(toReservationResponse)
  }, 200)
})

app.openapi(createReservationRoute, async (c) => {
  const { id } = c.req.valid('param')
  const { reservedBy, date, startTime, endTime } = c.req.valid('json')

  if (startTime >= endTime) {
    return c.json({ error: 'startTime must be before endTime' }, 400)
  }

  const resource = await prisma.resource.findUnique({ where: { id } })
  if (!resource) {
    return c.body(null, 404)
  }

  // Check for overlapping reservations: newStart < existingEnd AND newEnd > existingStart
  const overlapping = await prisma.reservation.findFirst({
    where: {
      resourceId: id,
      date,
      startTime: { lt: endTime },
      endTime: { gt: startTime }
    }
  })

  if (overlapping) {
    return c.json({
      error: 'Time slot conflicts with an existing reservation',
      conflictsWith: toReservationResponse(overlapping)
    }, 409)
  }

  const reservation = await prisma.reservation.create({
    data: {
      resourceId: id,
      reservedBy,
      date,
      startTime,
      endTime
    }
  })

  return c.json(toReservationResponse(reservation), 201)
})

app.openapi(deleteReservationRoute, async (c) => {
  const { id, reservationId } = c.req.valid('param')

  await prisma.reservation.deleteMany({
    where: {
      id: reservationId,
      resourceId: id
    }
  })

  return c.body(null, 204)
})

export type AppType = typeof app
