import dotenv from 'dotenv';
import prisma from '../lib/prisma';

dotenv.config();

function decodeLatin1ToUtf8(input: string): string {
  try {
    return Buffer.from(input, 'latin1').toString('utf8');
  } catch {
    return input;
  }
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run');

  const jobs = await prisma.uploadJob.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200
  });

  let changed = 0;
  for (const job of jobs) {
    const decoded = decodeLatin1ToUtf8(job.fileName);
    const looksGarbled = /[\ufffd]|[\x80-\xff]/.test(job.fileName) || decoded !== job.fileName;

    if (!looksGarbled) continue;

    console.log(`ID=${job.id} :: '${job.fileName}' -> '${decoded}'`);
    changed++;

    if (!dryRun) {
      await prisma.uploadJob.update({
        where: { id: job.id },
        data: { fileName: decoded }
      });
    }
  }

  console.log(`\n${dryRun ? '[DRY-RUN] ' : ''}Total changed: ${changed}`);
}

main().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});


