/** Used to match words to create compound words. */
const reWords = (function() {
  const upper = '[A-Z\\xc0-\\xd6\\xd8-\\xde]'
  const lower = '[a-z\\xdf-\\xf6\\xf8-\\xff]+'

  return RegExp(upper + '+(?=' + upper + lower + ')|' + upper + '?' + lower + '|' + upper + '+|[0-9]+', 'g')
}())

function wrap(str: string, fn: (prevValue: string, currentValue: string, currentIndex: number, ref: string[]) => string): string {
  let matches = str.match(reWords)
  return matches ? matches.reduce(fn, '') : str
}

export const transformer = {
  /**
   * hello-world  =>  helloWorld
   */
  camel(str: string): string {
    return wrap(str, (result, word, index) => {
      return result + word.charAt(0)[index ? 'toUpperCase' : 'toLowerCase']() + word.slice(1)
    })
  },

  /**
   * hello-world  => HelloWorld
   */
  capitalize(str: string): string {
    return wrap(str, (result, word, index) => {
      return result + word.charAt(0).toUpperCase() + word.slice(1)
    })
  },

  /**
   * hello-world  =>  HELLO_WORLD
   */
  upper(str: string): string {
    return wrap(str, (result, word, index) => {
      return result + (index ? '_' : '') + word.toUpperCase()
    })
  },

  /**
   * hello-world  =>  hello_world
   */
  snake(str: string): string {
    return wrap(str, (result, word, index) => {
      return result + (index ? '_' : '') + word.toLowerCase()
    })
  }
}
