export async function del(req, res) {
  const id = Number(req.params.id);

  try {
    await req.app.get("db").reports.destroy(id);
    res.end(JSON.stringify({}));
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function patch(req, res) {
  const data = req.body;

  delete data.stackTrace;

  try {
    const report = await req.app.get("db").reports.save(data);

    delete report.dump;
    delete report.search;

    res.end(JSON.stringify(report));
  } catch (error) {
    console.error(error);
    throw error;
  }
}
