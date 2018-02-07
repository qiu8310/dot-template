module.exports = function() {
  return {
    templates: [
      {
        name: 'dir',
        matches: 'dir*'
      },
      {
        name: 'dir',
        matches: 'filter-text',
        filter(copy) {
          return copy.rawName === 'text.txt'
        }
      },
      {
        name: 'dir',
        matches: 'filter-content',
        filter(copy) {
          return copy.rawName === 'text.txt' ? {content: 'hack'} : false
        }
      },
      {
        name: 'dir',
        matches: 'filter-name',
        filter(copy) {
          return copy.rawName === 'text.txt' ? {name: 'hack'} : false
        }
      },
      {
        name: 'dir',
        matches: 'filter-content-name',
        filter(copy) {
          return copy.rawName === 'text.txt' ? {content: 'hack', name: 'hack'} : false
        }
      },
      {
        name: 'dir',
        matches: 'filter-path',
        filter(copy) {
          return copy.rawName === 'text.txt' ? {filePath: 'hack'} : false
        }
      },
      {
        name: 'dir',
        matches: 'filter-path-invalid',
        filter(copy) {
          return copy.rawName === 'text.txt' ? {filePath: './js/dir/hack'} : false
        }
      },
    ]
  }
}
