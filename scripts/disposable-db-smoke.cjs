'use strict'

// Runs ONLY in a disposable CI PostgreSQL service. This smoke test must never
// be pointed at staging/production: it creates and deletes synthetic accounts.
const { strict: assert } = require('node:assert')
const { randomUUID } = require('node:crypto')
const { PrismaClient } = require('@prisma/client')

if (process.env.MEETOPIA_DISPOSABLE_DB !== 'yes') {
  throw new Error('Refusing database writes without MEETOPIA_DISPOSABLE_DB=yes')
}
const dbUrl = process.env.DATABASE_URL || ''
if (!/^postgresql:\/\/postgres:postgres@(?:localhost|127\.0\.0\.1):5432\/meetopia(?:\?|$)/.test(dbUrl)) {
  throw new Error('Refusing database writes: must use CI disposable local PostgreSQL.')
}

async function main() {
  const prisma = new PrismaClient()
  const suffix = randomUUID().slice(0, 10)
  const names = [`test-a-${suffix}`, `test-b-${suffix}`]
  let a, b
  try {
    for (let i = 0; i < 2; i += 1) {
      const user = await prisma.user.create({
        data: {
          email: `${names[i]}@example.invalid`,
          username: names[i],
          password: 'disposable-test-only-not-a-real-password',
          adultConfirmedAt: new Date(),
          chemistryIntent: 'relationship',
          chemistryStyle: i === 0 ? 'balanced' : 'playful',
          chemistryInterests: i === 0 ? ['music', 'travel'] : ['music', 'food'],
        },
      })
      if (i === 0) a = user
      else b = user
    }
    assert.deepEqual(a.chemistryInterests, ['music', 'travel'])
    assert.equal(b.chemistryIntent, 'relationship')

    const connection = await prisma.connection.create({
      data: { userAId: a.id, userBId: b.id },
    })
    await prisma.encore.create({
      data: {
        connectionId: connection.id,
        userAChoice: 'coffee-chat',
        userAShared: true,
      },
    })
    const record = await prisma.encore.findUnique({ where: { connectionId: connection.id } })
    assert.equal(record.userAChoice, 'coffee-chat')
    assert.equal(record.userBChoice, null)
    assert.equal(record.userBShared, false)

    await prisma.encore.update({
      where: { connectionId: connection.id },
      data: { userBChoice: 'playlist-swap', userBShared: true },
    })
    await prisma.sharedCreation.create({
      data: {
        connectionId: connection.id,
        themeId: 'music-memories',
        activity: 'live-music',
        setting: 'cafe',
      },
    })
    const creation = await prisma.sharedCreation.findUnique({ where: { connectionId: connection.id } })
    assert.equal(creation.themeId, 'music-memories')
    assert.equal(creation.activity, 'live-music')
    assert.equal(creation.setting, 'cafe')
    await prisma.connection.delete({ where: { id: connection.id } })
    assert.equal(await prisma.encore.findUnique({ where: { connectionId: connection.id } }), null,
      'Spark Card/Encore must cascade-delete with its parent Connection')
    assert.equal(await prisma.sharedCreation.findUnique({ where: { connectionId: connection.id } }), null,
      'Co-Creation must cascade-delete with its parent Connection')
    console.log('Disposable PostgreSQL migrations, chemistry fields, Encore, jointly shared creation and cascade-delete passed.')
  } finally {
    for (const user of [a, b]) {
      if (user) await prisma.user.deleteMany({ where: { id: user.id } })
    }
    await prisma.$disconnect()
  }
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
