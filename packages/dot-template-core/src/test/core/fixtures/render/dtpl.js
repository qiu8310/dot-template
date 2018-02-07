module.exports = function(s) {

  return {
    templates: [
      {
        name: 'r1.dtpl',
        matches: 'dtpl*'
      },
      {
        name: 'r2.ejs',
        matches: 'ejs*'
      },
      {
        name: 'r3.njk',
        matches: 'njk*'
      },
      {
        name: 'r4.txt',
        matches: 'txt*'
      }
    ]
  }
}
