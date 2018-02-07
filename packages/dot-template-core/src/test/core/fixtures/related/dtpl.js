module.exports = function (source) {
  let EOL = '\n'
  let newline = 'newline' + EOL

  return {
    templates: [
      {
        name: 'no-inject',
        matches: (minimatch) => {
          return source.filePath.indexOf('no-inject') >= 0
        },
        related: () => {
          return [
            {
              relativePath: './relative/no-inject'
            },
            {
              relativePath: 'absolute/other'
            }
          ]
        }
      },
      {
        name: 'inject',
        matches: 'template'
      },
      {
        name: 'inject',
        matches: 'inject-start',
        related: () => {
          return [{
            relativePath: './a',
            reference: newline
          }]
        }
      },
      {
        name: 'inject',
        matches: 'inject-row',
        related: () => {
          return [{
            relativePath: './a',
            reference: newline,
            begin: {row: 1, col: 0}
          }]
        }
      },
      {
        name: 'inject',
        matches: 'inject-overflow-row',
        related: () => {
          return [{
            relativePath: './a',
            reference: newline,
            begin: {row: 100, col: 0}
          }]
        }
      },
      {
        name: 'inject',
        matches: 'inject-col',
        related: () => {
          return [{
            relativePath: './a',
            reference: newline,
            begin: {row: 1, col: 4}
          }]
        }
      },
      {
        name: 'inject',
        matches: 'inject-overflow-col',
        related: () => {
          return [{
            relativePath: './a',
            reference: newline,
            begin: {row: 1, col: 400}
          }]
        }
      },

      {
        name: 'inject',
        matches: 'inject-range-in-line',
        related: () => {
          return {
            relativePath: './a',
            reference: newline,
            begin: {row: 0, col: 0},
            end: {row: 0, col: 2}
          }
        }
      },

      {
        name: 'inject',
        matches: 'inject-range-in-line-overflow',
        related: () => {
          return {
            relativePath: './a',
            reference: newline,
            begin: {row: 0, col: 1},
            end: {row: 0, col: 100}
          }
        }
      },

      {
        name: 'inject',
        matches: 'inject-range-in-two-line',
        related: () => {
          return {
            relativePath: './a',
            reference: newline,
            begin: {row: 0, col: 0},
            end: {row: 1, col: 2}
          }
        }
      },

      {
        name: 'inject',
        matches: 'inject-range-in-two-line-overflow',
        related: () => {
          return {
            relativePath: './a',
            reference: newline,
            begin: {row: 0, col: 1},
            end: {row: 4, col: 2}
          }
        }
      },
      {
        name: 'inject',
        matches: 'inject-template',
        related: () => {
          return {
            relativePath: './template',
            reference: newline
          }
        }
      },

      {
        name: 'replace',
        matches: 'replace*',
        related: () => {
          return []
        }
      },

      {
        name: 'style',
        matches: 'style1*',
        related(data) {
          return {
            relativePath: `./${data.fileName}.css`,
            reference: '---',
            smartInsertStyle: true
          }
        }
      },
      {
        name: 'style',
        matches: 'style2*',
        related(data) {
          return {
            relativePath: `./${data.MODULE_NAME}.css`,
            reference: '---',
            smartInsertStyle: true
          }
        }
      },
      {
        name: 'style',
        matches: 'style3*',
        related(data) {
          return {
            relativePath: `./style3.css`,
            reference: '---',
            smartInsertStyle: true
          }
        }
      }
    ]
  }

}
