const { spawn } = require('node:child_process');
const child = spawn(process.execPath, [require.resolve('expo/bin/cli'), 'start', ...process.argv.slice(2)], {
    stdio: 'inherit',
});
child.on('exit', code => { process.exitCode = code || 0; });
child.on('error', error => { console.error(error.message); process.exitCode = 1; });
function stop() {
    child.kill();
}
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
