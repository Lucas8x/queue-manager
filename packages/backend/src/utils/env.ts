export const PORT = process.env.PORT
  ? Number.parseInt(process.env.PORT, 10)
  : 9674;

export const IS_PROD = process.env.NODE_ENV === 'production';
