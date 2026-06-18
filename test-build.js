const { execSync } = require('child_process');
try {
  console.log('Running npm run build...');
  const output = execSync('npm run build', { cwd: './app', stdio: 'pipe' });
  console.log('Build succeeded:');
  console.log(output.toString());
} catch (error) {
  console.error('Build failed:');
  console.error(error.stdout ? error.stdout.toString() : '');
  console.error(error.stderr ? error.stderr.toString() : '');
}
