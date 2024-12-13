export const toSnakeCase = <T>(obj: any): T => {
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase) as T;
  }

  if (obj !== null && typeof obj === "object") {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      acc[snakeKey] = obj[key];
      return acc;
    }, {} as any) as T;
  }

  return obj as T;
};
