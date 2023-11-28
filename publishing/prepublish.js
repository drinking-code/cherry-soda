import path from 'path'
import fs from 'fs'

const packageJsonFilePath = path.resolve('.', 'package.json')
fs.cpSync(packageJsonFilePath, path.resolve('.', '_package.json'))
const packageJsonFile = fs.readFileSync(packageJsonFilePath, 'utf-8')
const packageJson = JSON.parse(packageJsonFile)

for (const dependency in packageJson.dependencies) {
    if (dependency.startsWith('@cherry-soda')) {
        packageJson.dependencies[dependency] = `^${getCurrentPackageVersion(packageJson.dependencies[dependency])}`
    }
}

fs.writeFileSync(packageJsonFilePath, JSON.stringify(packageJson, null, 2), 'utf-8')

function getCurrentPackageVersion(packagePath) {
    const packageJsonFilePath = path.resolve(packagePath, 'package.json')
    const packageJsonFile = fs.readFileSync(packageJsonFilePath, 'utf-8')
    const packageJson = JSON.parse(packageJsonFile)
    return packageJson.version
}
