#!/usr/bin/env node

'use strict';

import { program, Option } from 'commander';
import chalk from 'chalk';
import { password as passwordInput } from '@inquirer/prompts';
import SscasnApi from '../lib/services/sscasn-api.js';
import mongodb from '../lib/services/mongodb.js';
import { cout } from '../lib/utils/cout.js';
import { sleep } from '../lib/utils/sleep.js';

program
  .requiredOption('--kode-pendidikan <kode>', 'Kode/ID Pendidikan/Jurusan')
  .option('--instansi-id <id>', 'ID Instansi')
  .option('-u, --username <username>', 'MongoDB Username, password will be prompted')
  .option('-d, --database <name>', 'Database Name', 'cpns')
  .option('--with-details', 'Get details for each Formasi', false)
  .addOption(new Option('--min-interval <ms>', 'Min random interval in ms').conflicts('disable-interval').default(1000))
  .addOption(new Option('--max-interval <ms>', 'Max random interval in ms').conflicts('disable-interval').default(5000))
  .addOption(new Option('--disable-interval', 'Disable interval. WARNING! Your IP might get blocked'));

program.parse(process.argv);

const cliOpts = program.opts();

let auth = null;
if (cliOpts.username) {
  // Prompt for password
  auth = {
    username: cliOpts.username,
    password: await passwordInput({ message: `Enter password for ${cliOpts.username}: ` })
  };
}

// Initialize MongoDB client
cout.writeLine(chalk.green(`Connecting to MongoDB...`));
const client = await mongodb.init(auth);
const collection = client.db(cliOpts.database).collection('formasi');
cout.writeLine(chalk.green(`Connected to MongoDB`));

cout.write(chalk.green(`Fetching data from SSCASN API...`));
let totalData = 0;
let itemPerPage = 10;
let iteration = 0;
let maxIteration = 0;
let interval = 0;
let minInterval = parseInt(cliOpts.minInterval);
let maxInterval = parseInt(cliOpts.maxInterval);
// Fetch all data and save it to mongodb
// if data already exists update it
const dataForInsert = [];
const dataForUpdate = [];
if (cliOpts.disableInterval) {
  minInterval = 0;
  maxInterval = 0;
}

do {
  interval = Math.trunc(Math.random() * (maxInterval - minInterval)) + minInterval;

  cout.replaceCurrentLine(chalk.green(`Fetch SSCASN API... ${iteration + 1}/${maxIteration + 1} | interval: ${interval}ms`));
  let response = await SscasnApi.getAllFormasi(cliOpts.kodePendidikan, cliOpts.instansiId, (iteration * itemPerPage));
  let responseJson = response.data;

  if (responseJson?.data?.data) {
    if (cliOpts.withDetails) {
      cout.write(chalk.green(" | Fetching details ..."))
    }

    responseJson.data.data.forEach(async formasi => {
      const existingData = await collection.findOne(
        { formasi_id: formasi.formasi_id },
        { projection: { formasi_id: 1 } }
      );

      if (cliOpts.withDetails) {
        formasi = (await SscasnApi.getDetailFormasi(formasi.formasi_id)).data?.data || formasi;
      }

      if (existingData) {
        dataForUpdate.push(formasi);
      } else {
        dataForInsert.push(formasi);
      }
    });

    if (!totalData) {
      totalData = responseJson.data.meta.total;
      maxIteration = Math.ceil(totalData / itemPerPage) - 1;
    }
  }

  await sleep(interval);
} while (iteration++ < maxIteration);

cout.writeLine();
cout.writeLine(chalk.green(`Fetched ${totalData} data from SSCASN API`));

cout.writeLine(chalk.green(`Saving data to MongoDB...`));
await collection.insertMany(dataForInsert);
dataForUpdate.forEach(async formasi => {
  await collection.replaceOne({ formasi_id: formasi.formasi_id }, formasi);
})
cout.writeLine(chalk.green(`Data saved to MongoDB`));

client.close().catch(console.dir);

cout.writeLine(chalk.green(`Done!`));
