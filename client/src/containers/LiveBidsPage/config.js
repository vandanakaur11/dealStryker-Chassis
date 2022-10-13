export const SOCKET_URI =
  process.env.NODE_ENV === "production"
    ? process.env.SOCKET_URI || process.env.ServerAddress
    : process.env.ServerAddress;