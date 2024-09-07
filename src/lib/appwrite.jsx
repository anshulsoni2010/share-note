import { Client, Account, Databases, Storage } from "appwrite";

export const client = new Client();

const endpoint = import.meta.env.VITE_APP_ENDPOINT;
const projectId = import.meta.env.VITE_APP_PROJECT_ID;

console.log('Appwrite Endpoint:', endpoint);
console.log('Appwrite Project ID:', projectId);

if (!endpoint || !projectId) {
  console.error('Appwrite configuration is missing. Please check your .env file.');
}

client
  .setEndpoint(endpoint)
  .setProject(projectId);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export { ID } from "appwrite";

// the config for appwrite
// id generate the unique id
