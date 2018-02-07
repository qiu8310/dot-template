import {Project, File, delay} from './inc/'

let pro: Project

describe('emit', () => {
  beforeEach(() => pro = new Project('createDirectories', '.dtpl'))
  afterEach(() => pro.destroy())

  it('text file', async () => {
    let f = new File('upper-foo', pro)
    f.write('')
    pro.app.emitNewFile(f.path)

    await delay(800)
    await pro.matchListens(1, [{type: 'updatedFile', args: [f.name, 'UPPER_FOO', '']}])
  })

  it('two text file', async () => {
    let f1 = new File('upper-foo', pro)
    f1.write('')
    pro.app.emitNewFile(f1.path)

    await delay(10)

    let f2 = new File('upper-bar', pro)
    f2.write('')
    pro.app.emitNewFile(f2.path)


    await delay(800)
    await pro.matchListens(2, [
      {type: 'updatedFile', args: [f1.name, 'UPPER_FOO', '']},
      {type: 'updatedFile', args: [f2.name, 'UPPER_BAR', '']}
    ])
  })

  it('folder', async () => {
    let f = new File('folder-foo', pro)
    f.dir()
    pro.app.emitNewFile(f.path)

    await delay(800)
    await pro.matchListens(1)
  })

  it('two folder', async () => {
    let f1 = new File('folder-foo', pro)
    f1.dir()
    pro.app.emitNewFile(f1.path)

    await delay(10)

    let f2 = new File('folder-bar', pro)
    f2.dir()
    pro.app.emitNewFile(f2.path)

    await delay(800)
    await pro.matchListens(2)
  })

  it('file and folder', async () => {
    let f1 = new File('upper-foo', pro)
    f1.write('')
    pro.app.emitNewFile(f1.path)

    await delay(10)

    let f2 = new File('folder-bar', pro)
    f2.dir()
    pro.app.emitNewFile(f2.path)

    await delay(800)
    await pro.matchListens(2)
  })
})

