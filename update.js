#!/usr/bin/env node

'use strict'

var fs = require('fs')
var got = require('got')
var cheerio = require('cheerio')

// Sysinternals Utilities Index
const INDEX_URL = 'https://technet.microsoft.com/en-us/sysinternals/bb545027'

got(INDEX_URL, function (err, data, res) {
  if (err) throw err

  var list = parse(data)
  var obj = {
    time: (new Date()).toString(),
    list: list
  }
  fs.writeFileSync('page/data.js', 'module.exports = ' + JSON.stringify(obj))
  eula(list)
})

function parse (htmlStr) {
  var $ = cheerio.load(htmlStr)
  var ret = []

  var $list = $('.MiddleColumn').eq(0).children('p').slice(1, -1)
  $list.each(function (i) {
    var $this = $(this)
    var $a = $this.children('a').eq(0)
    var name = $a.text().trim()
    var href = $a.attr('href')

    // Disk Usage (DU) -> DU
    // Process Explorer -> ProcessExplorer
    var zipName
    var idx = name.indexOf('(')
    if (idx > 0) {
      zipName = name.slice(idx + 1, -1)
    } else {
      zipName = name.replace(' ', '')
    }

    var $em, parts, version, date
    try {
      $em = $this.children('em').eq(0)
      parts = $em.text().split(/\(|\)/)
      version = parts[0].trim()
      date = parts[1].trim()
      date = transformDate(date)
    } catch (err) {
      console.log(i, name, parts)
      return
    }

    $a.remove()
    $em.remove()

    var description = $this.text().trim()
    // exceptions
    if (name === 'DiskView') {
      description = description.slice(1)
    }

    ret.push({
      name: name,
      zipName: zipName,
      href: href,
      version: version,
      date: date,
      description: description
    })
  })

  return ret
}

function transformDate (str) {
  var d = new Date(str)
  return d.getFullYear() + '-' + twoDigits(d.getMonth() + 1) +
    '-' + twoDigits(d.getDate())

  function twoDigits (x) {
    return x < 10 ? '0' + x : x
  }
}

function eula (list) {
  var arr = list.map(function (x) {
    return '[HKEY_CURRENT_USER\\Software\\Sysinternals\\' + x.name + ']\r\n' +
      '"EulaAccepted"=dword:00000001'
  })

  var content = 'Windows Registry Editor Version 5.00\r\n\r\n' + arr.join('\r\n\r\n')

  fs.writeFileSync('sysinternals_all.reg', content)
}
