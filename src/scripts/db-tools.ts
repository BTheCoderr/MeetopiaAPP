/* Temporarily disabled for UI development
import { exec } from 'child_process'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const URI = process.env.MONGODB_URI
const DB = process.env.MONGODB_DB

const commands = {
  backup: `mongodump --uri "${URI}" --db ${DB} --ssl --authenticationDatabase admin`,
  restore: `mongorestore --uri "${URI}" --db ${DB} --ssl --authenticationDatabase admin ./dump/${DB}`,
  // Add more commands as needed
}

const command = process.argv[2]
if (!commands[command]) {
  console.log('Available commands:', Object.keys(commands).join(', '))
  process.exit(1)
}

exec(commands[command], (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error}`)
    return
  }
  console.log(stdout)
  if (stderr) console.error(stderr)
}) 
*/