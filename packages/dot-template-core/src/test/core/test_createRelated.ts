
import {Project, File} from './inc/'

let pro: Project
async function createFile(name: string, content: string, result: boolean): Promise<File> {
  let f = new File(name, pro)
  f.write(content)
  await f.related(result)
  return f
}

describe('createRelated init', () => {
  beforeEach(() => pro = new Project('createRelated', 'related', false))
  afterEach(() => pro.destroy())

  it('should return false when file is not exists or file is not text file', async () => {
    let f = new File('xxx', pro)
    await f.related(false)

    f.dir()
    await f.related(false)
  })

  it('should return false when no related source', async () => {
    await createFile('xxx', '', false)
  })

  it('should return false when has related source but file not exists', async () => {
    let f = new File('no-inject', pro)
    await f.related(false)
  })

  it('should return true when file exists and has related source', async () => {
    await createFile('no-inject', 'any', true)
  })
})

describe('createRelated execute & event', () => {
  beforeEach(() => pro = new Project('createRelated', 'related'))
  afterEach(() => pro.destroy())

  it('related files should be created and rendered', async () => {
    await createFile('a/no-inject', '', true)
    let f1 = new File('a/relative/no-inject', pro)
    let f2 = new File('absolute/other', pro)
    f1.shouldExists()
    f2.shouldExists()

    f1.shouldMatch('no-inject content')
    f2.shouldMatch('')

    await pro.matchListens(3, [{type: 'createdFile'}, {type: 'updatedFile'}, {type: 'createdFile'}])
  })

  it('inject-start', async () => {
    let s = await createFile('a/inject-start', 'line1\nline2', true)
    new File('a/a', pro).shouldExists()
    s.shouldMatch('newline\nline1\nline2', true)
  })

  it('inject-row', async () => {
    let s = await createFile('inject-row', 'line1\nline2', true)
    new File('a', pro).shouldExists()
    s.shouldMatch('line1\nnewline\nline2', true)
  })

  it('inject-overflow-row', async () => {
    let s = await createFile('inject-overflow-row', 'line1\nline2\n', true)
    new File('a', pro).shouldExists()
    s.shouldMatch('line1\nline2\nnewline\n', true)
  })

  it('inject-col', async () => {
    let s = await createFile('inject-col', 'line1\nline2', true)
    new File('a', pro).shouldExists()
    s.shouldMatch('line1\nlinenewline\n2')
  })

  it('inject-overflow-col', async () => {
    let s = await createFile('inject-overflow-col', 'line1\nline2', true)
    new File('a', pro).shouldExists()
    s.shouldMatch('line1\nline2newline\n', true)
  })

  it('inject-range-in-line', async () => {
    let s = await createFile('inject-range-in-line', 'line1\nline2', true)
    new File('a', pro).shouldExists()
    s.shouldMatch('newline\nne1\nline2', true)
  })


  it('inject-range-in-line-overflow', async () => {
    let s = await createFile('inject-range-in-line-overflow', 'line1\nline2', true)
    new File('a', pro).shouldExists()
    s.shouldMatch('lnewline\nline2', true)
  })

  it('inject-range-in-two-line', async () => {
    let s = await createFile('inject-range-in-two-line', 'line1\nline2', true)
    new File('a', pro).shouldExists()
    s.shouldMatch('newline\nne2', true)
  })

  it('inject-range-in-two-line-overflow', async () => {
    let s = await createFile('inject-range-in-two-line-overflow', 'line1\nline2\n', true)
    new File('a', pro).shouldExists()
    s.shouldMatch('lnewline\n', true)
  })

  it('inject source and template related', async () => {
    let s = await createFile('inject-template', 'line1\nline2', true)
    let f = new File('template', pro)
    f.shouldExists()
    f.shouldMatch('template')
    s.shouldMatch('newline\nline1\nline2', true)
  })

  it('inject-style1', async () => {
    let s = await createFile('style1.js', '/**\n * foo\n * bar\n */\n', true)
    let f = new File('style1.css', pro)
    f.shouldExists()
    s.shouldMatch('/**\n * foo\n * bar\n */\n\n---\n', true)
  })

  it('inject-style2', async () => {
    let s = await createFile('style2.js', '\nconst a = require("...")\nconst b = require("xxx")\n\nmodule.exports = () => {}', true)

    let f = new File('STYLE_2.css', pro)
    f.shouldExists()
    s.shouldMatch('\nconst a = require("...")\nconst b = require("xxx")\n\n---\n\nmodule.exports = () => {}', true)
  })

  it('inject-style3', async () => {
    let s = await createFile('style3.js', '\n\/\/ ---\n', true)

    let f = new File('style3.css', pro)
    f.shouldExists()
    s.shouldMatch('\n---\n', true)
  })

})

describe('createRelated rollback', () => {
  beforeEach(() => pro = new Project('createRelated', 'related'))
  afterEach(() => pro.destroy())

  it('related files should be revoke', async () => {
    await createFile('a/no-inject', '', true)
    let f1 = new File('a/relative/no-inject', pro)
    let f2 = new File('absolute/other', pro)
    f1.shouldExists()
    f2.shouldExists()

    await pro.unredoAsync(true)

    await pro.matchListens(5, [{type: 'createdFile'}, {type: 'updatedFile'}, {type: 'createdFile'}, {type: 'deletedFile'}, {type: 'deletedFile'}])
  })

  it('related files should not be revoke if it was deleted', async () => {
    await createFile('a/no-inject', '', true)
    let f1 = new File('a/relative/no-inject', pro)
    let f2 = new File('absolute/other', pro)
    f1.shouldExists()
    f2.shouldExists()

    f1.delete()

    await pro.unredoAsync(true)

    await pro.matchListens(4, [{type: 'createdFile'}, {type: 'updatedFile'}, {type: 'createdFile'}, {type: 'deletedFile'}])
  })

  it('revoke inject-start', async () => {
    let s = await createFile('inject-start', 'line1\nline2', true)
    new File('a', pro).shouldExists()
    s.shouldMatch('newline\nline1\nline2', true)

    await pro.unredoAsync(true)
    s.shouldMatch('line1\nline2', true)
  })

  it('will not revoke inject-start, if file is deleted', async () => {
    let s = await createFile('inject-start', 'line1\nline2', true)
    new File('a', pro).shouldExists()
    s.shouldMatch('newline\nline1\nline2', true)

    s.delete()

    await pro.unredoAsync(true)
    s.shouldNotExists()
  })
})

