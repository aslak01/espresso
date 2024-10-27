import { stringify } from "@std/csv/stringify";
import { parse } from "@std/csv/parse";

export async function writeToCsv(
  data: Record<string, string | number>[],
  filePath: string,
) {
  const columns = Object.keys(data[0]);

  const file = await Deno.open(filePath, {
    append: true,
  });

  const fileInfo = await file.stat();
  const fileSize = fileInfo.size;

  const headers = fileSize < 10;

  const csvData = stringify(data, { headers, columns });

  const readable = ReadableStream.from(csvData);
  await readable.pipeThrough(new TextEncoderStream()).pipeTo(file.writable);

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

  const { isFile } = await csvFile.stat();

  if (isFile !== true) {
    return [];
  }

  const csvData = [];

  for await (const chunk of csvFile.readable) {
    csvData.push(chunk);
  }

  const csvText = new TextDecoder().decode(...csvData).trim();

  if (!csvText && !csvText.length) {
    return [];
  }

  console.log(csvText);

  const data = parse(csvText, {
    skipFirstRow: true,
  });

  return data;
}
