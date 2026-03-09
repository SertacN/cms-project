import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),

  DATABASE_URL: Joi.string().required(),

  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().optional().allow(''),

  JWT_SECRET: Joi.string().min(16).required(),
  JWT_EXPIRES_IN: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().min(16).required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().required(),

  API_KEY: Joi.string().required(),

  SESSION_SECRET: Joi.string().min(16).required(),

  CACHE_TTL: Joi.number().default(300),

  FRONTEND_URL: Joi.string().uri().required(),
  CORS_ORIGIN: Joi.string().required(),

  FILE_MAX_SIZE_MB: Joi.number().min(1).max(100).default(9),
});
