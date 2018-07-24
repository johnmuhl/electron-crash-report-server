// eslint-disable-next-line import/prefer-default-export
export async function get(req, res) {
  const id = Number(req.params.id);

  try {
    const report = await req.app.get("db").reports.find(id);
    // eslint-disable-next-line no-underscore-dangle
    const name = `${report.body._productName}-crash-${id}.dmp`;

    res.setHeader("content-disposition", `attachment; filename=${name}`);
    res.setHeader("content-type", "application/x-dmp");
    res.end(report.dump);
  } catch (error) {
    throw new Error(error);
  }
}
