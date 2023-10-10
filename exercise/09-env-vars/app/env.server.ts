import invariant from "tiny-invariant";

// 📝 NOTE: here we create the utility function to get environment variables, 
// this could be split to client and server side functions if we didn't want to expose the same on both


export function getEnv() {
  invariant(typeof process.env.ADMIN_EMAIL === "string", ".ENV for ADMIN EMAIL undefined")

  return {
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  };
}

// 📝 NOTE: below are the global types for node (server), and browser (client)

type ENV = ReturnType<typeof getEnv>

declare global {
  var ENV: ENV;
  interface Window {
    ENV: ENV;
  }
}