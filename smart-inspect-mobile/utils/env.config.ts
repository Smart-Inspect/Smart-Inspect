class Environment {
  public API_URL: string | undefined;
}

const ENV = new Environment();

if (process.env.NODE_ENV === "production") {
  ENV.API_URL = "";
} else {
  ENV.API_URL = "http://localhost:3000";
}

export { ENV };
