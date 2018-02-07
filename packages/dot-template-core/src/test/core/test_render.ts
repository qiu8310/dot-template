import {Project, File} from './inc/'

let pro: Project

describe('render', () => {
  beforeEach(() => pro = new Project('render', 'render'))
  afterEach(() => pro.destroy())

  it('dtpl', async () => {
    let f = new File('dtpl-test', pro)
    await f.create(true)
    f.shouldMatch('DTPL_TEST')
  })
  it('ejs', async () => {
    let f = new File('ejs-test', pro)
    await f.create(true)
    f.shouldMatch('EJS_TEST')
  })
  it('njk', async () => {
    let f = new File('njk-test', pro)
    await f.create(true)
    f.shouldMatch('NJK_TEST')
  })
  it('no', async () => {
    let f = new File('txt-test', pro)
    await f.create(true)
    f.shouldMatch('MODULE_NAME')
  })
})
