
import {Project, File, assert} from './inc/'

let pro: Project
async function createFile(name: string, content: string, result: boolean, open?: boolean): Promise<File>
async function createFile(name: string, result: boolean, open?: boolean): Promise<File>
async function createFile(name: string, contentOrResult: boolean | string, resultOrOpen?: boolean, open?: boolean): Promise<File> {
  let content: string | false
  let result: boolean
  if (typeof contentOrResult === 'string') {
    content = contentOrResult
    result = !!resultOrOpen
  } else {
    content = false
    result = contentOrResult
    open = resultOrOpen
  }
  let f = new File(name, pro)
  if (content !== false) f.write(content)
  await f.create(result, open)
  return f
}

describe('createFiles whit no template', () => {

  beforeEach(() => pro = new Project('createFiles'))
  afterEach(() => pro.destroy())

  it('should return false when specified a empty string file', async () => {
    await pro.createTemplateFilesAsync('', false)
  })

  it('should not create files outside project', async () => {
    await pro.createTemplateFilesAsync('../some', false)
  })

  it('should create a empty file without any template', async () => {
    let f = await createFile('empty', true)
    f.shouldBeTextFile()
  })

  it('should return true when file exists and no content in it', async () => {
    let f = await createFile('some', '', true)
    f.shouldMatch('')
  })

  it('should return false when file exists and has content in it', async () => {
    let f = await createFile('some', 'some content', false)
    f.shouldMatch('some content')
  })

  it('should create file and open it', async () => {
    let f = await createFile('some', true, true)
    f.shouldOpened()
  })
})

describe('createFiles with template', () => {
  beforeEach(() => pro = new Project('createFiles', '.dtpl'))
  afterEach(() => pro.destroy())

  it('should create file with content', async () => {
    let f = await createFile('upper.txt', true) // 后缀被去掉了
    f.shouldMatch('UPPER')
  })
  it('should update empty file', async () => {
    let f = await createFile('upper-foo', '', true)
    f.shouldMatch('UPPER_FOO')
  })
  it('should not update contened file', async () => {
    await createFile('upper.txt', 'xx', false)
  })
  it('should render dot prop variable', async () => {
    let f = await createFile('var-yes.txt', true)
    f.shouldMatch('foobar')
  })
  it('should not render when variable not exists in data', async () => {
    let f = await createFile('var-no.txt', true)
    f.shouldMatch('${foo.bar}')
  })
  it('should just copy template content, no render', async () => {
    let f = await createFile('text1.txt', true)
    f.shouldMatch('Just text no replace $fileName')
  })

  it('should return true when setFileContent=true and file is opened', async () => {
    pro.editor.returnWhenSetFileContent = true
    let f = new File('upper', pro)
    f.write('')
    await f.openAsync()
    f.shouldOpened()
    await f.create(true)
  })
  it('should return true when setFileContent=false and file is opened, but content not update', async () => {
    pro.editor.returnWhenSetFileContent = false
    let f = new File('upper', pro)
    f.write('')
    await f.openAsync()
    f.shouldOpened()
    await f.create(true)
    f.shouldMatch('')
  })
  it('should return true when setFileContent=false and file is not opened, but content not update', async () => {
    pro.editor.returnWhenSetFileContent = false
    let f = new File('upper', pro)
    f.write('')
    f.shouldNotOpened()
    await f.create(true)
    f.shouldMatch('')
  })
  it('should warning when template is not exists', async () => {
    let f = await createFile('noexistsxxx', true)
    f.shouldMatch('')
    assert(pro.editor.test_warnings.length === 1)
  })
  // it('should warning when is file but template is directory', async () => {
  //   let f = await createFile('folder-xx', '', true)
  //   f.shouldMatch('')
  //   assert.equal(pro.editor.test_warnings.length, 1)
  // })
})

describe('createFiles events', () => {
  beforeEach(() => pro = new Project('createFiles', '.dtpl'))
  afterEach(() => pro.destroy())

  it('should emit create event when no file and no template', async () => {
    await createFile('xxx', true)
    await pro.matchListens(1, [{type: 'createdFile', args: ['xxx', '']}])
  })
  it('should emit create & update event when no file and has template', async () => {
    await createFile('upper-xx', true)
    await pro.matchListens(2, [{type: 'createdFile', args: ['upper-xx', '']}, {type: 'updatedFile', args: ['upper-xx', 'UPPER_XX', '']}])
  })
  it('should emit update event when has file and as template', async () => {
    await createFile('upper-bb', '', true)
    await pro.matchListens(1, [{type: 'updatedFile', args: ['upper-bb', 'UPPER_BB', '']}])
  })
  it('should emit nothing when has file and no template', async () => {
    await createFile('xx', '', true)
    await pro.matchListens(0)
  })
  it('should only emit once when file is dumplicated', async () => {
    await pro.createTemplateFilesAsync(['xx1', 'xx2', 'xx1'], true)
    await pro.matchListens(2)
  })
})

describe('undo & redo createFiles', () => {
  beforeEach(() => pro = new Project('createFiles', '.dtpl'))
  afterEach(() => pro.destroy())

  it('undo createdFile no template', async () => {
    let f = await createFile('xx', true)
    f.shouldExists()
    await pro.unredoAsync(true)
    f.shouldNotExists()
    await pro.matchListens(2, [{type: 'createdFile'}, {type: 'deletedFile', args: ['xx']}])
    await pro.unredoAsync(true)
    f.shouldExists()
  })

  it('undo createdFile with template', async () => {
    let f = await createFile('upperj', true)
    f.shouldExists()
    await pro.unredoAsync(true)
    f.shouldNotExists()
    await pro.matchListens(3, [{type: 'createdFile'}, {type: 'updatedFile'}, {type: 'deletedFile', args: ['upperj']}])
    await pro.unredoAsync(true)
    f.shouldExists()
  })

  it('undo createdFile with file no template', async () => {
    let f = await createFile('xx', '', true)
    f.shouldExists()
    f.shouldMatch('')
    await pro.unredoAsync(true)
    f.shouldExists()
    f.shouldMatch('')
    await pro.unredoAsync(true)
    f.shouldExists()
    f.shouldMatch('')
  })

  it('undo createdFile with file with template', async () => {
    let f = await createFile('uppert', '', true)
    f.shouldExists()
    f.shouldMatch('UPPERT')
    await pro.unredoAsync(true)
    f.shouldExists()
    f.shouldMatch('')
    await pro.unredoAsync(true)
    f.shouldExists()
    f.shouldMatch('UPPERT')
  })

  it('should confirm when file is updated', async () => {
    let f = await createFile('upperj', '', true)
    f.shouldExists()
    f.shouldMatch('UPPERJ')
    f.write('new')
    pro.editor.returnWhenConfirm = false // 触发 return false
    await pro.unredoAsync(false)
    f.shouldMatch('new')

    pro.editor.returnWhenConfirm = true // 触发 return true
    await pro.unredoAsync(true)
    f.shouldMatch('')
  })

  it('should not confirm when file is deleted', async () => {
    let f = await createFile('upperj', '', true)
    f.shouldExists()
    f.shouldMatch('UPPERJ')
    f.delete()
    pro.editor.returnWhenConfirm = false // 触发 return false
    await pro.unredoAsync(true)
    f.shouldMatch('')
    await pro.matchListens(2, [{type: 'updatedFile'}, {type: 'createdFile'}])
  })

  it('should do nothing when file is not exist in the first and delete', async () => {
    let f = await createFile('xxx', true)
    f.delete()
    await pro.unredoAsync(true)
    await pro.matchListens(1, [{type: 'createdFile'}])
  })

  it('should report error when setFileContent error in undo', async () => {
    let f = await createFile('upperj', '', true)
    pro.editor.returnWhenSetFileContent = false
    await pro.unredoAsync(true)
    assert.equal(pro.editor.test_errors.length, 1)
    f.shouldMatch('UPPERJ')
  })

  it('should reopen file when file is close', async () => {
    let f = new File('yyy', pro)
    f.write('')
    await f.openAsync()
    await f.create(true)
    await pro.matchListens(0)
    f.delete()
    await f.closeAsync()
    await pro.unredoAsync(true)
    f.shouldOpened()
  })

})
