import { createClient } from "@libsql/client";

// Initialize the LibSQL client
// NOTE: For Vector Search, you will need to enable the vector extension in Turso/LibSQL
const client = createClient({
  url: process.env.LIBSQL_URL || "libsql://tu-base-de-datos.turso.io",
  authToken: process.env.LIBSQL_AUTH_TOKEN,
});

export interface ContentItem {
  title: string;
  slug: string;
  body: string;
  status: 'draft' | 'published';
  author: string;
  tags: string[];
  embedding?: number[]; // Vector support for Semantic Search
}

/**
 * Pushes content to the LibSQL database.
 * Designed to support future Semantic Search by allowing an embedding field.
 */
export const pushContentToAstro = async (content: ContentItem) => {
  try {
    if (!process.env.LIBSQL_URL || !process.env.LIBSQL_AUTH_TOKEN) {
      console.warn("LibSQL Credentials missing. Simulating database write with Vector placeholder.");
      return { success: true, simulated: true };
    }

    // Schema expected for Vector Search support:
    // CREATE TABLE posts (
    //   id INTEGER PRIMARY KEY, 
    //   slug TEXT UNIQUE, 
    //   title TEXT, 
    //   body TEXT, 
    //   tags TEXT,
    //   embedding F32_BLOB(768), -- Dimensions depend on your embedding model (e.g., Gemini is 768)
    //   created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    // );
    // CREATE INDEX post_embedding_idx ON posts (libsql_vector_idx(embedding));
    
    await client.execute({
      sql: "INSERT INTO posts (title, slug, body, status, author, tags, embedding, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now')) ON CONFLICT(slug) DO UPDATE SET body=excluded.body, title=excluded.title",
      args: [
        content.title, 
        content.slug, 
        content.body, 
        content.status, 
        content.author, 
        JSON.stringify(content.tags),
        content.embedding ? JSON.stringify(content.embedding) : null // Pass vector blob here in real impl
      ]
    });

    return { success: true, simulated: false };
  } catch (error) {
    console.error("LibSQL Error:", error);
    throw error;
  }
};

/**
 * Stub for Semantic Search using LibSQL Vector Search
 */
export const searchSemanticContent = async (queryEmbedding: number[]) => {
    // Example vector search query
    // SELECT title, body, vector_distance_cos(embedding, ?) as distance 
    // FROM posts ORDER BY distance LIMIT 5;
    console.log("Searching semantically...", queryEmbedding.length);
    return [];
}

export const getDeploymentStatus = async () => {
   try {
    if (!process.env.LIBSQL_URL) return { lastDeployment: new Date(), status: 'ready' };
    const result = await client.execute("SELECT * FROM deployments ORDER BY created_at DESC LIMIT 1");
    return result.rows[0];
   } catch (error) {
     return { lastDeployment: null, status: 'error' };
   }
};