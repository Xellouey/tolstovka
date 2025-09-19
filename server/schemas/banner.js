export const bannerSchema = {
  type: 'object',
  properties: {
    image: { 
      type: 'string', 
      minLength: 1,
      format: 'uri',
      description: 'URL изображения баннера'
    },
    href: { 
      type: 'string',
      minLength: 1,
      description: 'Ссылка для перехода при клике на баннер'
    },
    active: { 
      type: 'boolean',
      default: true,
      description: 'Активен ли баннер'
    }
  },
  required: ['image', 'href'],
  additionalProperties: false
}

export const bannerUpdateSchema = {
  type: 'object',
  properties: {
    image: { 
      type: 'string', 
      minLength: 1,
      format: 'uri'
    },
    href: { 
      type: 'string',
      minLength: 1
    },
    active: { 
      type: 'boolean'
    },
    order: {
      type: 'integer',
      minimum: 1
    }
  },
  minProperties: 1,
  additionalProperties: false
}

export const bannerReorderSchema = {
  type: 'object',
  properties: {
    banners: {
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
  required: ['banners'],
  additionalProperties: false
}