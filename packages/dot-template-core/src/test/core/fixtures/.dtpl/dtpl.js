module.exports = function(source) {
  return {
    templates: [
      {
        name: 'upper.dtpl',
        matches: ['upper*']
      },
      {
        name: 'variable.dtpl',
        matches: ['var-yes*'],
        localData: {
          foo: {bar: 'foobar'}
        }
      },
      {
        name: 'variable.dtpl',
        matches: ['var-no*'],
        localData: {foo: 'foo', bar: 'bar'}
      },
      {
        name: 'text.txt',
        matches: ['text*']
      },
      {
        name: 'folder',
        matches: 'folder*'
      },
      {
        name: 'not-exists-file',
        matches: 'noexists*'
      }
    ]
  }
}
