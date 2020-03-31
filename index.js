#!/usr/bin/env node

const fetch = require('node-fetch')
const chalk = require('chalk')
const Table = require('cli-table3');

(async function () {
  const response = await fetch('https://api.rootnet.in/covid19-in/stats/latest')
  const json = await response.json()

  const { regional, summary } = json.data

  const mapRegionToRow = region => [
    region.loc,
    region.confirmedCasesIndian + region.confirmedCasesForeign,
    region.discharged,
    region.deaths
  ]

  const mapSummaryToRow = summary => [
    'Total',
    summary.total,
    summary.discharged,
    summary.deaths
  ]

  const rows = []
  rows.push(...regional.map(mapRegionToRow))
  rows.push(mapSummaryToRow(summary))

  const table = new Table({
    head: [
      'Rank',
      'Name of State / UT',
      'Confirmed Cases',
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
  console.log('Stay home. Stay safe.')

  const printResource = (name, link) => {
    console.log(`${chalk.cyan(name)}: ${chalk.blueBright.underline(link)}`)
  }

  printResource('Code', 'https://github.com/itsfadnis/coronavirus-india')
  printResource('Ministry of health & family welfare', 'https://www.mohfw.gov.in')
})()
