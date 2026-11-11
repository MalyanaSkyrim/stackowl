import bcrypt from 'bcryptjs'

import { db } from '../../src'

const SEED_USER_EMAIL = 'demo@example.com'
const SEED_USER_PASSWORD = 'password123'

/**
 * Local development seed (idempotent). Creates or reuses one verified demo user you can sign
 * in with, and gives it two notes. Add your own seeders next to this file as your schema grows.
 */
async function main() {
  console.log('🌱 Starting seed...\n')

  const passwordHash = await bcrypt.hash(SEED_USER_PASSWORD, 10)

  const user = await db.user.upsert({
    where: { email: SEED_USER_EMAIL },
    update: {},
    create: {
      email: SEED_USER_EMAIL,
      passwordHash,
      name: 'Demo',
      emailVerified: new Date(),
    },
  })

  const notes = [
    { id: 'seed-note-welcome', title: 'Welcome', body: 'This note comes from the seed.' },
    {
      id: 'seed-note-next',
      title: 'Next steps',
      body: 'Copy the notes feature for your first real one, then delete it.',
    },
  ]
  for (const note of notes)
    await db.note.upsert({
      where: { id: note.id },
      update: {},
      create: { ...note, userId: user.id },
    })

  console.log(`✅ Demo user ready: ${user.email} / ${SEED_USER_PASSWORD}`)
  console.log('\n🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e)
    process.exitCode = 1
  })
  .finally(async () => {
    await db.$disconnect()
  })
