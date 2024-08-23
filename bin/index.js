#!/usr/bin/env node

'use strict';

import { program } from 'commander';
import chalk from 'chalk';
import { password as passwordInput } from '@inquirer/prompts';
import SscasnApi from '../lib/services/sscasn-api.js';
import mongodb from '../lib/services/mongodb.js';
import { cout } from '../lib/utils/cout.js';
import { sleep } from '../lib/utils/sleep.js';

program
  .requiredOption('--kode-pendidikan <kode>', 'Kode/ID Pendidikan/Jurusan')
  .option('-u, --username <username>', 'MongoDB Username, password will be prompted')
  .option('-d, --database <name>', 'Database Name', 'cpns');

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
let interval = Math.trunc(Math.random() * 4000) + 1000;
// Fetch all data and save it to mongodb
// if data already exists update it
const dataForInsert = [];
const dataForUpdate = [];
do {
  cout.replaceCurrentLine(chalk.green(`Fetching data from SSCASN API... ${iteration + 1}/${maxIteration + 1} next in: ${interval}`));
  let response = await SscasnApi.getAllFormasi(cliOpts.kodePendidikan, null, (iteration * itemPerPage));
  let responseJson = response.data;

  if (responseJson?.data?.data) {
    responseJson.data.data.forEach(async formasi => {
      const existingData = await collection.findOne(
        { formasi_id: formasi.formasi_id },
        { projection: { formasi_id: 1 } }
      );
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
  interval = Math.trunc(Math.random() * 4000) + 1000;
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
