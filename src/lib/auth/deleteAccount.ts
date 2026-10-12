import { prisma } from '../prisma'

export async function deleteUserAccount(userId: string, db: typeof prisma = prisma) {
  await db.$transaction(async tx => {
    await tx.message.deleteMany({
      where: { OR: [{ senderId: userId }, { receiverId: userId }] },
    })
    await tx.report.deleteMany({
      where: { OR: [{ reporterId: userId }, { reportedUserId: userId }] },
    })
    await tx.feedback.deleteMany({ where: { userId } })
    await tx.user.update({
      where: { id: userId },
      data: { friends: { set: [] }, friendOf: { set: [] } },
    })
    await tx.user.delete({ where: { id: userId } })
  })
}
