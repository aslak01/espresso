import { CsvStringifyStream } from "jsr:@std/csv";

export async function writeToCsv(
  data: Record<string, string | number>[],
  filePath: string,
) {
  const headers = Object.keys(data[0]);
  console.log("headers", headers, "data", data);

  const file = await Deno.open(filePath, {
    write: true,
    create: true,
    truncate: false,
  });

  const readable = ReadableStream.from(data);

  await readable
    .pipeThrough(new CsvStringifyStream({ separator: "\t", columns: headers }))
    .pipeThrough(new TextEncoderStream())
    .pipeTo(file.writable);

  return 0;
}
