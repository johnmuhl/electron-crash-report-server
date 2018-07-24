import multiparty from "multiparty";
import { promisify } from "util";
import { readFile } from "fs";

const readFileAsync = promisify(readFile);

// eslint-disable-next-line import/prefer-default-export
export function post(req, res) {
  const body = {};
  const form = new multiparty.Form();

  form.parse(req, async (error, fields, files) => {
    if (error) {
      console.error(error);
      throw error;
    }

    const dump = await readFileAsync(files.upload_file_minidump[0].path);

    Object.entries(fields).forEach(entry => {
      // eslint-disable-next-line prefer-destructuring
      body[entry[0]] = entry[1][0];
    });

    const report = await req.app.get("db").reports.save({ body, dump });

    res.end(`${report.id}`);
  });
}
