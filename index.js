/* ==========================================================================
   CatnipLab - Render Web Service Node.js Entry Server
   ========================================================================== */

const { execSync } = require('child_process');
const port = process.env.PORT || 3000;

console.log(`🐱 CatnipLab: Launching static file server on port ${port}...`);

try {
  execSync(`npx serve -s . -l ${port}`, { stdio: 'inherit' });
} catch (err) {
  console.error("Server execution error:", err);
  process.exit(1);
}
