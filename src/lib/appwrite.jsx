import { Client, Account, Databases, Storage } from "appwrite";

const client = new Client()
    .setEndpoint(import.meta.env.VITE_APP_ENDPOINT)
    .setProject(import.meta.env.VITE_APP_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export { ID } from "appwrite";

// Remove or comment out the following line:
// client.setKey(import.meta.env.VITE_APP_API_KEY);

// the config for appwrite
// id generate the unique id
