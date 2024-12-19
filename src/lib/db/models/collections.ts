// Define your collections
export const COLLECTIONS = {
  USERS: 'users',
  CHATS: 'chats',
  VIDEOS: 'videos',
  REPORTS: 'reports'
}

// Create collections with schemas
export async function initializeCollections(db: any) {
  await db.createCollection(COLLECTIONS.USERS, {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["name", "email"],
        properties: {
          name: { bsonType: "string" },
          email: { bsonType: "string" },
          age: { bsonType: "int" },
          interests: { bsonType: "array" },
          blockedUsers: { bsonType: "array" }
        }
      }
    }
  })

  await db.createCollection(COLLECTIONS.VIDEOS, {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["url", "userId"],
        properties: {
          url: { bsonType: "string" },
          userId: { bsonType: "string" },
          likes: { bsonType: "int" },
          createdAt: { bsonType: "date" }
        }
      }
    }
  })
} 