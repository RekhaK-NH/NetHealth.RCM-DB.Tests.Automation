import fs from 'fs';
import path from 'path';

async function globalTeardown() {
  console.log('🧹 Starting global teardown...');

  // Optional: Clean up auth files if needed
  // const authDir = path.join(__dirname, 'auth');
  // if (fs.existsSync(authDir)) {
  //   fs.readdirSync(authDir).forEach(file => {
  //     if (file.endsWith('.json')) {
  //       fs.unlinkSync(path.join(authDir, file));
  //     }
  //   });
  // }

  // Optional: Clean up test data
  // await cleanupTestData();

  console.log('✅ Global teardown completed!');
}

export default globalTeardown;
