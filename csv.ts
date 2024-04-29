import { CsvStringifyStream, parse } from "jsr:@std/csv";

export async function writeToCsv(
  data: Record<string, string | number>[],
  filePath: string,
) {
  const headers = Object.keys(data[0]);

  const file = await Deno.open(filePath, {
    write: true,
    create: true,
    truncate: false,
  });

  const readable = ReadableStream.from(data);

  await readable
    .pipeThrough(new CsvStringifyStream({ columns: headers }))
    .pipeThrough(new TextEncoderStream())
    .pipeTo(file.writable);

  return 0;
}

export async function readCsv(
  filePath: string,
): Promise<Record<string, string | undefined>[]> {
  const csvFile = await Deno.open(filePath, {
    read: true,
    write: true,
    create: true,
  });
  const info = await csvFile.stat();
  if (info.isFile) {
    const csvData = [];
    for await (const chunk of csvFile.readable) {
      csvData.push(chunk);
    }
    const csvText = new TextDecoder().decode(...csvData);
    const data = parse(csvText, {
      skipFirstRow: true,
    });
    return data;
  }
  return [];
}
