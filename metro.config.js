const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

const projectRoot = __dirname
const sharedRoot = path.resolve(projectRoot, '../indiegames-app/src')

const config = getDefaultConfig(projectRoot)

config.watchFolders = [sharedRoot]
config.resolver.extraNodeModules = {
  '@shared': sharedRoot,
}

module.exports = config
