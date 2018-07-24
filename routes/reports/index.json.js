// eslint-disable-next-line import/prefer-default-export
export async function get(req, res) {
  const col = "body, created_at, id, open";
  const sql = `SELECT ${col} FROM reports ORDER BY created_at DESC`;

  try {
    const reports = await req.app.get("db").query(sql);

    /* eslint-disable no-param-reassign */
    reports.forEach(report => {
      delete report.dump;
      delete report.search;
    });
    /* eslint-enable no-param-reassign */

    res.writeHead(200, { "Content-Type": "application/json" });

    res.end(JSON.stringify(reports));
  } catch (error) {
    console.error(error);
    throw error;
  }
}
