// eslint-disable-next-line import/prefer-default-export
export async function get(req, res) {
  const id = Number(req.params.id);

  try {
    const report = await req.app.get("db").reports.find(id);

    if (!report) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "not found" }));
    }

    delete report.dump;
    delete report.search;

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(report));
  } catch (error) {
    console.error(error);
    throw error;
  }
}
