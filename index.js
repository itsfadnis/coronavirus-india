#!/usr/bin/env node

const cheerio = require('cheerio')
const fetch = require('node-fetch')
const chalk = require('chalk')
const Table = require('cli-table3');

(async function () {
  const response = await fetch('https://www.mohfw.gov.in')
  const $ = cheerio.load(await response.text())

  let totalCases = 0
  let totalRecoveries = 0
  let totalDeaths = 0
  const rows = []

  const tRows = $('#cases tbody tr')
  tRows.each((index, tr) => {
    // Do not process last row (It is a summary we don't need)
    if (index === tRows.length - 1) {
      rows.push(['Total', totalCases, totalRecoveries, totalDeaths])
      return
    }

    const children = $(tr).children()

    // Name of state
    const state = $(children.get(1)).text()

    // Cases
    const indian = parseInt($(children.get(2)).text(), 10)
    const foreign = parseInt($(children.get(3)).text(), 10)
    const cases = indian + foreign
    totalCases += cases

    // Recovered
    const recovered = parseInt($(children.get(4)).text(), 10)
    totalRecoveries += recovered

    // Deaths
    const deaths = parseInt($(children.get(5)).text(), 10)
    totalDeaths += deaths

    rows.push([state, cases, recovered, deaths])
  })

  const table = new Table({
    head: [
      'Rank',
      'Name of State / UT',
      'Confirmed  Cases',
      'Recovered',
      'Deaths'
    ],
    chars: {
      top: '═',
      'top-mid': '╤',
      'top-left': '╔',
      'top-right': '╗',
      bottom: '═',
      'bottom-mid': '╧',
      'bottom-left': '╚',
      'bottom-right': '╝',
      left: '║',
      'left-mid': '╟',
      mid: '─',
      'mid-mid': '┼',
      right: '║',
      'right-mid': '╢',
      middle: '│'
    }
  })

  table.push(
    ...rows
    // Sort by max number of cases
      .sort((a, b) => b[1] - a[1])
      .map(([state, cases, recovered, deaths], index) => {
        return [
          index === 0 ? '' : chalk.blackBright(index),
          state,
          cases,
          chalk.green(recovered),
          chalk.redBright(deaths)
        ]
      })
  )

  console.log(table.toString())
})()
