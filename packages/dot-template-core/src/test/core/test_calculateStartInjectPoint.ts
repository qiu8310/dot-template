import {calculateStartInjectPoint} from '../../core/commands/CreateRelatedFilesCommand'
import * as assert from 'assert'


let c1 = `
import * as React from 'react'
import {Widget} from '@hujiang/foe-common'

export namespace ControlContainer {
  export interface Props extends Widget.InjectProps {
    foo: string
  }

  export type State = typeof initState
}

const initState = {}

/** 表单控件的容器 */
export class ControlContainer extends React.PureComponent<ControlContainer.Props, ControlContainer.State> {
  state: ControlContainer.State = initState
}
`

describe('calculateStartInjectPoint', () => {
  it('c1', () => {
    assert.deepEqual(calculateStartInjectPoint(c1, 'import x'), {begin: {row: 3, col: 0}})
  })
})
