export const loginSchema = {
  type: 'object',
  properties: {
    username: { 
      type: 'string', 
      minLength: 3,
      maxLength: 50,
      description: 'Имя пользователя'
    },
    password: { 
      type: 'string',
      minLength: 4,
      maxLength: 100,
      description: 'Пароль'
    }
  },
  required: ['username', 'password'],
  additionalProperties: false
}

export const changePasswordSchema = {
  type: 'object',
  properties: {
    currentPassword: { 
      type: 'string', 
      minLength: 4,
      maxLength: 100,
      description: 'Текущий пароль'
    },
    newPassword: { 
      type: 'string',
      minLength: 6,
      maxLength: 100,
      description: 'Новый пароль (минимум 6 символов)'
    }
  },
  required: ['currentPassword', 'newPassword'],
  additionalProperties: false
}