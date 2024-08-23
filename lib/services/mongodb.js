
import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = process.env.MONGODB_CONNECTION_STRING;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
let client = null;

/**
 * Initialize MongoClient with username and password
 * @param {object?} auth
 * @returns {Promise<MongoClient>}
 */
export async function init(auth = null) {
  if (!client) {
    if (!uri) {
      throw new Error('MONGODB_CONNECTION_STRING is not provided');
    }
    client = new MongoClient(uri, {
      auth,
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });
  }

  return client.connect();
}

export default {
  init
}
