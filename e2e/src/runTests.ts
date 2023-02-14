import * as path from 'path'
import * as semver from 'semver'
import { ExTester, ReleaseQuality } from 'vscode-extension-tester'

async function main(): Promise<void> {
  const vsCodeVersion: semver.SemVer = new semver.SemVer(`1.66.0`)
  const version = vsCodeVersion.version

  const storageFolder = path.join(__dirname, '..', 'storage')
  const extFolder = path.join(__dirname, '..', 'extensions')

  try {
    const testPath = path.join(__dirname, 'command.test.js')

    const exTester = new ExTester(storageFolder, ReleaseQuality.Stable, extFolder)
    await exTester.downloadCode(version)
    await exTester.installVsix({ useYarn: false })
    // await exTester.installFromMarketplace("eliostruyf.vscode-front-matter");
    await exTester.downloadChromeDriver(version)
    // await exTester.setupRequirements({vscodeVersion: version});
    const result = await exTester.runTests(testPath, {
      vscodeVersion: version,
      resources: [storageFolder],
    })

    process.exit(result)
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
}

main()
