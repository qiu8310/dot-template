import {Project, File, delay, assert} from './inc'

describe('timeout', () => {
  it('undo timeout error', async () => {
    let p = new Project('timeout')
    p.editor.configuration.commandInvalidTimeout = 10
    let f = new File('xx', p)
    await f.create(true)
    await delay(20)

    try {
      await p.unredoAsync(false)
    } catch (e) {

      assert(e.message.indexOf('命令已经过期') > 0)
    }
    p.destroy()
  })

  it('redo timeout error', async () => {
    let p = new Project('timeout')
    p.editor.configuration.commandInvalidTimeout = 30
    let f = new File('xx', p)
    await f.create(true)
    await p.unredoAsync(true)

    await delay(50)
    try {
      await p.unredoAsync(false)
    } catch (e) {
      assert(e.message.indexOf('命令已经过期') > 0)
    }
    p.destroy()
  })
})
