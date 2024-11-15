class Environment {
  public API_URL: string | undefined;
}

const ENV = new Environment();

if (__DEV__) {
  // Change this to your local machine's IP address if you are testing with a physical device (Expo Go)
  ENV.API_URL = "http://localhost:3000";
} else {
  ENV.API_URL = "";
}

export { ENV };