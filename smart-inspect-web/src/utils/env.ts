class Environment {
  public API_URL: string | undefined;
}

const ENV = new Environment();

if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
  ENV.API_URL = "http://localhost:3000";
} else {
  ENV.API_URL = window.location.origin;
}

export { ENV };
