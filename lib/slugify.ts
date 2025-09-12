import slugify from 'slugify';

export const createSlug = (text: string) =>
  slugify(text, { lower: true, strict: true });
