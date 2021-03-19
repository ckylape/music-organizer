const NodeID3 = require('node-id3')
const globby = require('globby')
const slash = require('slash')
const fs = require('fs-extra')
const path = require('path')

module.exports = new class {
  BAD_CHARS = /[\/\\\|%":*?<>{}]/gm

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  aphalbetize(artist) {
    const cleaned = artist.split('/')[0].replace(this.BAD_CHARS, '')
    const alpha = cleaned[0].toUpperCase()
    return path.join(alpha, cleaned)
  }

  // probably a better way to this (without a library?)
  async removeEmptyDirectories(directory) {
    const fileStats = await fs.lstat(directory)

    // only care about directories
    if (!fileStats.isDirectory()) {
      return
    }

    // check if the directory is empty
    const fileNames = await fs.readdir(directory)
    if (fileNames.length > 0) {
      for(const fileName of fileNames) {
        await this.removeEmptyDirectories(path.join(directory, fileName))
      }
    } else {
      const parent = path.dirname(directory)
      await fs.rmdir(directory)
      await this.removeEmptyDirectories(parent)
    }
    return
  }

  async organizeFiles(files, destination) {
    try {
      for(const file of files) {
        const tags = NodeID3.read(file)
        const artist = tags.artist

        const newDir = path.join(destination, this.aphalbetize(artist))
        const newFile = path.join(newDir, path.basename(file))

        // create the new directory
        await fs.mkdirp(newDir, { recursive: true })

        // move the files
        await fs.move(file, newFile)
      }
    } catch (e) {
      console.error(e)
    }
  }

  async musicFiles(directory) {
    try {
      return await globby(slash(directory), {
        expandDirectories: {
          extensions: ['aac', 'mp3']
        }
      })
    } catch (e) {
      console.error(e)
    }
  }
}