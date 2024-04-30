import { parse, stringify } from "jsr:@std/csv";

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
  await readable
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
    if (csvText && csvText.length) {
      const data = parse(csvText, {
        skipFirstRow: true,
      });

      return data;
    }
  }
  return [];
}
