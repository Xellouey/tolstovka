export const productSchema = {
  type: 'object',
  properties: {
    categoryId: { 
      type: 'string', 
      minLength: 1,
      description: 'ID категории товара'
    },
    title: { 
      type: 'string',
      minLength: 1,
      maxLength: 200,
      description: 'Название товара'
    },
    priceRub: { 
      type: 'integer',
      minimum: 1,
      description: 'Цена товара в рублях (целое число)'
    },
    description: { 
      type: 'string',
      maxLength: 2000,
      description: 'Описание товара'
    },
    images: {
      type: 'array',
      items: {
        type: 'string',
        format: 'uri'
      },
      minItems: 1,
      maxItems: 10,
      description: 'Массив URL изображений товара'
    }
  },
  required: ['categoryId', 'title', 'priceRub', 'images'],
  additionalProperties: false
}

export const productUpdateSchema = {
  type: 'object',
  properties: {
    categoryId: { 
      type: 'string', 
      minLength: 1
    },
    title: { 
      type: 'string',
      minLength: 1,
      maxLength: 200
    },
    priceRub: { 
      type: 'integer',
      minimum: 1
    },
    description: { 
      type: 'string',
      maxLength: 2000
    },
    images: {
      type: 'array',
      items: {
        type: 'string',
        format: 'uri'
      },
      minItems: 1,
      maxItems: 10
    }
  },
  minProperties: 1,
  additionalProperties: false
}

export const productImagesReorderSchema = {
  type: 'object',
  properties: {
    images: {
      type: 'array',
      items: {
        type: 'string',
        format: 'uri'
      },
      minItems: 1,
      maxItems: 10
    }
  },
  required: ['images'],
  additionalProperties: false
}