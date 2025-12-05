import { QdrantClient } from "@qdrant/qdrant-js";

let qdrantClient: QdrantClient | null = null;

export function getQdrantClient(): QdrantClient {
  if (qdrantClient) {
    return qdrantClient;
  }

  const url = process.env.QDRANT_URL || "http://localhost:6333";
  const apiKey = process.env.QDRANT_API_KEY;

  qdrantClient = new QdrantClient({
    url,
    ...(apiKey && { apiKey }),
  });

  return qdrantClient;
}

export async function ensureCollection(collectionName: string) {
  const client = getQdrantClient();

  try {
    const collections = await client.getCollections();
    const exists = collections.collections.some(
      (c) => c.name === collectionName,
    );

    if (!exists) {
      await client.createCollection(collectionName, {
        vectors: {
          size: 1536, // OpenAI text-embedding-3-small dimension
          distance: "Cosine",
        },
      });
      console.log(`✅ Created Qdrant collection: ${collectionName}`);
    } else {
      console.log(`✅ Qdrant collection exists: ${collectionName}`);
    }

    // Ensure payload indexes exist for filtering
    await ensurePayloadIndexes(collectionName);
  } catch (error) {
    console.error("Error ensuring Qdrant collection:", error);
    throw error;
  }
}

/**
 * Ensure payload indexes exist for userId and keywords fields
 * These indexes are required for efficient filtering
 */
export async function ensurePayloadIndexes(collectionName: string) {
  const client = getQdrantClient();

  try {
    // Create index for userId (keyword type for exact matching)
    try {
      await client.createPayloadIndex(collectionName, {
        field_name: "userId",
        field_schema: "keyword",
      });
      console.log(`✅ Created payload index: userId (keyword)`);
    } catch (error: any) {
      // Index might already exist, which is fine
      if (error.message?.includes("already exists") || error.status?.error?.includes("already exists")) {
        // Index already exists, skip
      } else {
        console.warn(`⚠️  Could not create userId index:`, error.message || error);
      }
    }

    // Create index for keywords (keyword type for array matching)
    try {
      await client.createPayloadIndex(collectionName, {
        field_name: "keywords",
        field_schema: "keyword",
      });
      console.log(`✅ Created payload index: keywords (keyword)`);
    } catch (error: any) {
      // Index might already exist, which is fine
      if (error.message?.includes("already exists") || error.status?.error?.includes("already exists")) {
        // Index already exists, skip
      } else {
        console.warn(`⚠️  Could not create keywords index:`, error.message || error);
      }
    }

    // Create index for createdAt (datetime type for temporal queries)
    try {
      await client.createPayloadIndex(collectionName, {
        field_name: "createdAt",
        field_schema: "datetime",
      });
      console.log(`✅ Created payload index: createdAt (datetime)`);
    } catch (error: any) {
      if (error.message?.includes("already exists") || error.status?.error?.includes("already exists")) {
        // Index already exists, skip
      } else {
        console.warn(`⚠️  Could not create createdAt index:`, error.message || error);
      }
    }

    // Create index for sourceDate (datetime type for temporal queries)
    try {
      await client.createPayloadIndex(collectionName, {
        field_name: "sourceDate",
        field_schema: "datetime",
      });
      console.log(`✅ Created payload index: sourceDate (datetime)`);
    } catch (error: any) {
      if (error.message?.includes("already exists") || error.status?.error?.includes("already exists")) {
        // Index already exists, skip
      } else {
        console.warn(`⚠️  Could not create sourceDate index:`, error.message || error);
      }
    }
  } catch (error) {
    console.error("Error ensuring payload indexes:", error);
    // Don't throw - indexes are optional for basic functionality
  }
}

