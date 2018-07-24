import { unlink, writeFile } from "fs";
import { promisify } from "util";
import { resolve } from "path";
import { tmpdir } from "os";
import { walkStack } from "minidump";

const unlinkAsync = promisify(unlink);
const walkStackAsync = promisify(walkStack);
const writeFileAsync = promisify(writeFile);

// eslint-disable-next-line import/prefer-default-export
export async function get(req, res) {
  const id = Number(req.params.id);

  try {
    const report = await req.app.get("db").reports.find(id);
    const path = resolve(tmpdir(), `${report.id}.dmp`);

    await writeFileAsync(path, report.dump, "binary");
    const stack = await walkStackAsync(path);
    await unlinkAsync(path);

    res.end(JSON.stringify({ stackTrace: stack.toString() }));
  } catch (error) {
    throw new Error(error);
  }
}
