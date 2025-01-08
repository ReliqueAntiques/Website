import { Client, Account} from 'appwrite';

export const client = new Client();

client
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('677a615c000e7be7bcd4'); // Replace with your project ID

export const account = new Account(client);
export { ID } from 'appwrite';
