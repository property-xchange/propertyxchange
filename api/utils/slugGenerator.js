// utils/slugGenerator.js
export const generateSlug = (text) => {
  if (!text) return 'agent-' + Date.now();

  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

// Generate unique slug for agents
export const generateUniqueSlug = async (baseName, model, field = 'slug') => {
  let slug = generateSlug(baseName);
  let counter = 1;

  while (true) {
    const existing = await model.findFirst({
      where: { [field]: slug },
    });

    if (!existing) break;

    slug = `${generateSlug(baseName)}-${counter}`;
    counter++;
  }

  return slug;
};
