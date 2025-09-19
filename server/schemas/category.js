export const categorySchema = {
  type: 'object',
  properties: {
    name: { 
      type: 'string', 
      minLength: 1,
      maxLength: 100,
      description: 'Название категории'
    },
    slug: { 
      type: 'string',
      minLength: 1,
      maxLength: 100,
      pattern: '^[a-z0-9-]+$',
      description: 'URL-слаг категории (только латиница, цифры и дефисы)'
    }
  },
  required: ['name'],
  additionalProperties: false
}

export const categoryUpdateSchema = {
  type: 'object',
  properties: {
    name: { 
      type: 'string', 
      minLength: 1,
      maxLength: 100
    },
    slug: { 
      type: 'string',
      minLength: 1,
      maxLength: 100,
      pattern: '^[a-z0-9-]+$'
    },
    order: {
      type: 'integer',
      minimum: 1
    }
  },
  minProperties: 1,
  additionalProperties: false
}

export const categoryReorderSchema = {
  type: 'object',
  properties: {
    categories: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          order: { type: 'integer', minimum: 1 }
        },
        required: ['id', 'order'],
        additionalProperties: false
      },
      minItems: 1
    }
  },
  required: ['categories'],
  additionalProperties: false
}