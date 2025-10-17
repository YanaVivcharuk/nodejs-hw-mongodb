export function getEnvVar(key) {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Env variable "${key}" is not defined`);
  }

  return value;
}
