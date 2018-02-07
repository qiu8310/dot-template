import {Project, File, assert} from './inc/'
import * as fs from 'fs-extra'

let pro: Project
async function createDir(name: string, create: boolean, result: boolean): Promise<File> {
  let f = new File(name, pro)
  if (create) f.dir()
  await f.createDirectories(result)
  return f
}

describe('createDirectories init', () => {
  beforeEach(() => pro = new Project('createDirectories', 'js'))
  afterEach(() => pro.destroy())
  it('should return false when filePath is not directory', async () => {
    let f = new File('xx', pro)
    f.write('')
    await f.createDirectories(false)
  })
  it('should return false when directory has files in it', async () => {
    let f = new File('xx/a', pro)
    f.write('')
    await createDir('xx', false, false)
  })
  it('should return false when directory is not in project', async () => {
    await createDir('../xx', false, false)
  })

  it('should return true if directory not exists and not template', async () => {
    await createDir('xx', false, true)
  })
  it('should return true if directory is empty and not template', async () => {
    await createDir('xx', true, true)
  })

  it('should return true if directory not exists and has template', async () => {
    await createDir('dir', false, true)
  })
  it('should return true if directory is empty and has template', async () => {
    await createDir('dir', true, true)
  })
})

describe('createDirectories execute and events', () => {
  beforeEach(() => pro = new Project('createDirectories', 'js'))
  afterEach(() => pro.destroy())
  it('should create dir and files', async () => {
    await createDir('dir', false, true)
    let f1 = new File('dir/text.txt', pro)
    let f2 = new File('dir/DIR.js', pro)
    let f3 = new File('dir/foo/readme.md', pro)

    f1.shouldMatch('${MODULE_NAME}')
    f2.shouldMatch('${fileName}')
    f3.shouldMatch('README ref:DIR')
    await pro.matchListens(3, [{type: 'createdFile'}, {type: 'createdFile'}, {type: 'createdFile'}])
  })

  it('should create dir and files', async () => {
    await createDir('dir-foo', true, true)
    new File('dir-foo/text.txt', pro).shouldMatch('${MODULE_NAME}')
    new File('dir-foo/DIR_FOO.js', pro).shouldMatch('${fileName}')
    new File('dir-foo/foo/readme.md', pro).shouldMatch('README ref:DIR_FOO')

    await pro.matchListens(3, [{type: 'createdFile'}, {type: 'createdFile'}, {type: 'createdFile'}])
  })

  it('filter-text', async () => {
    let d = await createDir('filter-text', false, true)
    let f1 = new File('filter-text/text.txt', pro)
    f1.shouldMatch('${MODULE_NAME}')
    await pro.matchListens(1, [{type: 'createdFile'}])
    await pro.unredoAsync(true)
    await pro.matchListens(2, [{type: 'createdFile'}, {type: 'deletedFile'}])
    f1.shouldNotExists()
    d.shouldNotExists()
  })

  it('filter-content', async () => {
    let d = await createDir('filter-content', true, true)
    let f1 = new File('filter-content/text.txt', pro)
    f1.shouldMatch('hack')
    await pro.matchListens(1, [{type: 'createdFile'}])
    await pro.unredoAsync(true)
    await pro.matchListens(2, [{type: 'createdFile'}, {type: 'deletedFile'}])
    f1.shouldNotExists()
    d.shouldExists()
  })

  it('filter-name', async () => {
    await createDir('filter-name', true, true)
    let f1 = new File('filter-name/hack', pro)
    f1.shouldMatch('${MODULE_NAME}')
  })

  it('filter-content-name', async () => {
    await createDir('filter-content-name', true, true)
    let f1 = new File('filter-content-name/hack', pro)
    f1.shouldMatch('hack')
  })

  it('filter-path', async () => {
    await createDir('filter-path', true, true)
    let f1 = new File('hack', pro)
    f1.shouldMatch('${MODULE_NAME}')
  })

  it('filter-path-invalid', async () => {
    await createDir('filter-path-invalid', true, true)
    assert.equal(pro.editor.test_errors.length, 1)
  })
})

describe('createDirectories rollback and events', () => {
  beforeEach(() => pro = new Project('createDirectories', 'js'))
  afterEach(() => pro.destroy())
  it('should revert1', async () => {
    let d = await createDir('dir', false, true)
    let f1 = new File('dir/text.txt', pro)
    let f2 = new File('dir/DIR.js', pro)
    let f3 = new File('dir/foo/readme.md', pro)

    await pro.unredoAsync(true)

    f1.shouldNotExists()
    f2.shouldNotExists()
    f3.shouldNotExists()
    await pro.matchListens(6)
    d.shouldNotExists()
  })

  it('should revert2', async () => {
    let d = await createDir('dir', true, true)
    let f1 = new File('dir/text.txt', pro)
    let f2 = new File('dir/DIR.js', pro)
    let f3 = new File('dir/foo/readme.md', pro)

    await pro.unredoAsync(true)

    f1.shouldNotExists()
    f2.shouldNotExists()
    f3.shouldNotExists()
    await pro.matchListens(6)
    d.shouldExists()
  })
})


describe('create .dtpl folder', () => {
  beforeEach(() => pro = new Project('createDirectories', 'js'))
  afterEach(() => pro.destroy())

  it('should create system folder', async () => {
    pro.editor.configuration.dtplFolderName = '.dtpl'
    let d = await createDir('.dtpl', true, true)
    assert(fs.readdirSync(d.path).length > 0)
  })

  it('should create system specified folder', async () => {
    pro.editor.configuration.dtplFolderName = 'xx'
    let d = await createDir('xx', true, true)
    assert(fs.readdirSync(d.path).length > 0)
  })
})
