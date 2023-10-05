const { exec } = require('child_process');

// Get list of files from the command line arguments
const files = process.argv
    .slice(3)
    .map((file) => file.replace(/^ui\//, '')) // Remove the 'ui/' prefix from each file path
    .join(' ');

const command = process.argv[2];

// Construct the command
const commandWithFiles = `yarn ${command} ${files}`;

// Execute the command
exec(commandWithFiles, (error, stdout, stderr) => {
    if (error) {
        console.error(`Error: ${error.message}`);
        return 1;
    }

    if (stderr) {
        console.error(`Stderr: ${stderr}`);
        return 1;
    }
});
