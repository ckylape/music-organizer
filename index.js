const organizer = require('./src/organize-music')
const fs = require('fs-extra')
const args = require('minimist')(process.argv.slice(2))._

if (args.length !== 2) {
  console.error('Need to specify a SOURCE and DESTINATION.')
  exitPrompt()
} else {
  musicOrganizer(args[0], args[1])
}

async function musicOrganizer(source, destination) {
  const files = await organizer.musicFiles(source)
  if (files) {
    await organizer.organizeFiles(files, destination)
    await organizer.removeEmptyDirectories(source)

    console.log(`Renamed & moved ${files.length} music files to ${destination}`)
  } else {
    console.error('No music files found!')
  }
  exitPrompt()
}

function exitPrompt() {
  console.log('Press any key to exit');
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.on('data', process.exit.bind(process, 0));
}
