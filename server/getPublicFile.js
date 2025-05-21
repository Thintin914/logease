const path = require('path');
const fs = require('fs').promises;

module.exports.getPublicFile = async function getPublicFile(directory){
    let content = "";
    const dest = path.join(process.cwd(), 'public', directory);
    content = await fs.readFile(dest, "utf8");
    return content;
}