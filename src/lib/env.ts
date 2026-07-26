const PLACEHOLDER_PATTERNS = [
  "<user>",
  "<password>",
  "<host>",
  "<dbname>",
  "ep-xxx",
  "replace-with",
  "sk-or-v1-...",
] as const;

export class ConfigurationError extends Error {
  constructor(public readonly variable: string, message?: string) {
    super(message ?? `Missing required environment variable: ${variable}`);
    this.name = "ConfigurationError";
  }
}

export function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value || PLACEHOLDER_PATTERNS.some((placeholder) => value.includes(placeholder))) {
    throw new ConfigurationError(
      name,
      `${name} is not configured. Copy .env.example to .env.local and provide a real value.`
    );
  }

  return value;
}

export function getAuthEnv() {
  const baseUrl = getRequiredEnv("NEON_AUTH_BASE_URL");
  const cookieSecret = getRequiredEnv("NEON_AUTH_COOKIE_SECRET");

  if (cookieSecret.length < 32) {
    throw new ConfigurationError(
      "NEON_AUTH_COOKIE_SECRET",
      "NEON_AUTH_COOKIE_SECRET must be at least 32 characters long."
    );
  }

  try {
    new URL(baseUrl);
  } catch {
    throw new ConfigurationError(
      "NEON_AUTH_BASE_URL",
      "NEON_AUTH_BASE_URL must be a valid absolute URL."
    );
  }

  return { baseUrl, cookieSecret };
}

export function getConfigurationStatus() {
  const variables = [
    "DATABASE_URL",
    "NEON_AUTH_BASE_URL",
    "NEON_AUTH_COOKIE_SECRET",
    "OPENROUTER_API_KEY",
  ] as const;

  const missing: string[] = variables.filter((name) => {
    try {
      getRequiredEnv(name);
      return false;
    } catch {
      return true;
    }
  });

  try {
    getAuthEnv();
  } catch (error) {
    if (error instanceof ConfigurationError && !missing.includes(error.variable)) {
      missing.push(error.variable);
    }
  }

  return { configured: missing.length === 0, missing };
}
