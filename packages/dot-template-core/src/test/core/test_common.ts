import * as assert from 'assert'

import {series} from '../../common/helper'
import {transformer} from '../../common/transformer'

describe('helper', () => {
  it('series a empty array', async () => {
    assert.deepEqual(await series([], async (any) => any), [])
  })
  it('series a number array', async () => {
    assert.deepEqual(await series([1, 2, 3], async (num) => num * num), [1, 4, 9])
  })
})

describe('transformer', () => {
  it('camel', () => {
    assert.equal(transformer.camel(''), '')
    assert.equal(transformer.camel('aaa'), 'aaa')
    assert.equal(transformer.camel('a b'), 'aB')
    assert.equal(transformer.camel('A b'), 'aB')
    assert.equal(transformer.camel('中a'), 'a')
    assert.equal(transformer.camel('我 a'), 'a')
  })

  it('capitalize', () => {
    assert.equal(transformer.capitalize(''), '')
    assert.equal(transformer.capitalize('aaa'), 'Aaa')
    assert.equal(transformer.capitalize('a b'), 'AB')
    assert.equal(transformer.capitalize('A   B'), 'AB')
    assert.equal(transformer.capitalize('hello w'), 'HelloW')
  })

  it('snake', () => {
    assert.equal(transformer.snake('hello-world'), 'hello_world')
    assert.equal(transformer.snake('Hello world'), 'hello_world')
    assert.equal(transformer.snake('HelloWorld'), 'hello_world')
  })

  it('upper', () => {
    assert.equal(transformer.upper('aBc'), 'A_BC')
  })
})
