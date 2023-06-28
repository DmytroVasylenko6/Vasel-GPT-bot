const { unlink } = require('fs/promises');

module.exports = async function removeFile(path) {
  try {
    await unlink(path);
  } catch (e) {
    console.log('Error while removing file', e.message);
  }
};
