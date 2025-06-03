import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create test users
  const hashedPassword = await bcrypt.hash('password123', 12)
  
  const testUser1 = await prisma.user.upsert({
    where: { email: 'test1@example.com' },
    update: {},
    create: {
      email: 'test1@example.com',
      username: 'testuser1',
      password: hashedPassword,
      displayName: 'Test User 1',
      bio: 'I am a test user',
      interests: ['coding', 'testing'],
      isFlagged: false
    },
  })

  const testUser2 = await prisma.user.upsert({
    where: { email: 'test2@example.com' },
    update: {},
    create: {
      email: 'test2@example.com',
      username: 'testuser2',
      password: hashedPassword,
      displayName: 'Test User 2',
      bio: 'I am another test user',
      interests: ['chatting', 'video calls'],
      isFlagged: false
    },
  })

  // Make them friends
  await prisma.user.update({
    where: { id: testUser1.id },
    data: {
      friends: {
        connect: { id: testUser2.id }
      }
    }
  })

  console.log({ testUser1, testUser2 })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 