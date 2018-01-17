/* global document fetch Headers localStorage */
import "./index.css";
import icons from "./icons.png";
import preact from "preact";
import prettyMs from "pretty-ms";

const authorization = `Basic ${document.cookie.split("=")[1]}`;

function FilterClosed(props) {
  return preact.h(
    "div",
    null,
    preact.h(
      "label",
      null,
      preact.h("input", {
        checked: props.filters.get("closed"),
        onChange: props.onChange,
        type: "checkbox",
      }),
      "Show closed reports?"
    )
  );
}

function FilterApplication(props) {
  if (props.applications.size === 1) return null;

  return preact.h(
    "div",
    null,
    preact.h(
      "select",
      {
        onChange: props.onChange,
        value: props.filters.get("application"),
      },
      preact.h("option", { value: "" }, "Show all"),
      Array.from(props.applications).map((value, key) =>
        preact.h("option", { key, value }, value)
      )
    )
  );
}

/* eslint-disable no-underscore-dangle */
function ReportsTableRow(props) {
  const application = props.filters.get("application");
  const showClosed = props.filters.get("closed");
  const report = props.report[1];

  // filter by selected application
  if (application && report.body._productName !== application) return null;
  // filter by open status
  if (!showClosed && !report.open) return null;

  return preact.h(
    "tr",
    {
      class: report.id === props.selected ? "active" : null,
      "data-index": report.id,
    },
    preact.h(
      "td",
      null,
      preact.h(
        "button",
        {
          class: "details",
          onClick: props.showReportDetails,
        },
        preact.h("img", {
          alt: `View report ${report.id}`,
          class: "open-in-new large",
          src: icons,
        }),
        report.id
      )
    ),
    preact.h(
      "td",
      null,
      preact.h(
        "button",
        {
          class: report.open ? "open" : "closed",
          onClick: props.toggleReportStatus,
        },
        report.open ? "Open" : "Closed"
      )
    ),

    props.applications.size > 1 &&
      preact.h("td", null, report.body._productName),
    preact.h("td", null, report.body._version),
    preact.h("td", null, report.body.ver),
    preact.h("td", null, report.body.platform),
    preact.h("td", null, report.body.process_type),
    preact.h(
      "td",
      { class: "flex" },
      preact.h(
        "a",
        {
          class: "button icon download",
          href: `/reports/${report.id}/dump`,
        },
        preact.h("img", {
          alt: `Download minidump ${report.id}`,
          class: "file-download large",
          src: icons,
        })
      ),
      preact.h(
        "a",
        {
          class: "button icon view",
          href: `/reports/${report.id}/stack`,
        },
        preact.h("img", {
          alt: `View stack trace ${report.id}`,
          class: "open-in-browser large",
          src: icons,
        })
      )
    ),
    preact.h(
      "td",
      null,
      preact.h(
        "button",
        {
          class: "icon delete",
          onClick: props.deleteReport,
        },
        preact.h("img", {
          alt: `Delete report ${report.id}`,
          class: "delete-forever large",
          src: icons,
        })
      )
    )
  );
}
/* eslint-enable no-underscore-dangle */

function ReportsTable(props) {
  return preact.h(
    "table",
    null,
    preact.h(
      "thead",
      null,
      preact.h(
        "tr",
        null,
        preact.h("th", null, "ID"),
        preact.h("th", null, "Status"),
        props.applications.size > 1 && preact.h("th", null, "Application"),
        preact.h("th", null, "Version"),
        preact.h("th", null, "Electron"),
        preact.h("th", null, "Platform"),
        preact.h("th", null, "Process"),
        preact.h("th", null, "Minidump"),
        preact.h("th", null, "Delete")
      )
    ),
    preact.h(
      "tbody",
      null,
      Array.from(props.reports)
        .slice(0, props.limit)
        .map(report =>
          preact.h(ReportsTableRow, Object.assign({}, props, { report }))
        )
    ),
    props.reports.size > props.limit &&
      preact.h(
        "tfoot",
        null,
        preact.h(
          "tr",
          null,
          preact.h(
            "td",
            { colspan: props.applications.size > 1 ? 9 : 8 },
            preact.h(
              "button",
              {
                class: "more",
                onClick: props.showMoreReports,
              },
              "Load more"
            )
          )
        )
      )
  );
}

function reportLifetime(report) {
  const closed = new Date(report.closed_at || Date.now());
  const created = new Date(report.created_at);
  let duration = prettyMs(closed - created);

  if (duration.split(" ").length === 1) return duration;

  duration = duration.replace(/\s\d+[.\d]+s$/, "");

  return duration;
}

function ReportDetails(props) {
  if (props.selected == null) return null;

  const report = props.reports.get(props.selected);

  return preact.h(
    "div",
    { class: "report" },
    preact.h(
      "div",
      { class: "timestamp" },
      preact.h("img", {
        alt: "Created at",
        class: "access-time small",
        src: icons,
      }),
      new Date(report.created_at).toString()
    ),
    report.closed_at &&
      preact.h(
        "div",
        { class: "timestamp" },
        preact.h("img", {
          alt: "Closed at",
          class: "watch-later small",
          src: icons,
        }),
        new Date(report.closed_at).toString()
      ),
    preact.h(
      "div",
      { class: "timestamp" },
      preact.h("img", {
        alt: "Open for",
        class: "timer small",
        src: icons,
      }),
      reportLifetime(report)
    ),
    preact.h("pre", null, JSON.stringify(report.body, null, 2))
  );
}

export default class App extends preact.Component {
  constructor() {
    super();

    this.state = {
      applications: new Set([""]),
      filters: new Map([["application", ""], ["closed", true]]),
      limit: 50,
      reports: new Map(),
      selected: null,
      step: 50,
    };

    this.filterApplicationToggle = this.filterApplicationToggle.bind(this);
    this.filterClosedToggle = this.filterClosedToggle.bind(this);
    this.showMoreReports = this.showMoreReports.bind(this);
    this.showReportDetails = this.showReportDetails.bind(this);
    this.toggleReportStatus = this.toggleReportStatus.bind(this);
    this.deleteReport = this.deleteReport.bind(this);
  }

  async componentWillMount() {
    // Restore filters from localStorage
    if (localStorage.filtersApplication || localStorage.filtersClosed) {
      const application = localStorage.filtersApplication || "";
      let closed = localStorage.filtersClosed;

      if (closed == null) closed = false;
      closed = closed === "true";

      this.setState({
        filters: new Map([["application", application], ["closed", closed]]),
      });
    }

    try {
      const headers = new Headers({ authorization });
      const response = await fetch("/reports", { headers });

      if (response.status !== 200) return console.error(response);

      const json = await response.json();
      const reports = new Map(json.map(r => [r.id, r]));
      const applications = new Set(
        json
          .map(report => report.body._productName) // eslint-disable-line no-underscore-dangle
          .filter(item => item != null)
          .filter(item => item.toString().trim().length)
          .filter(item => !!item)
          .filter((item, index, array) => array.indexOf(item) === index)
          .sort()
      );

      return this.setState({ applications, reports });
    } catch (error) {
      throw new Error(error);
    }
  }

  filterApplicationToggle(event) {
    const filters = new Map([...this.state.filters]);
    const { value } = event.target;

    filters.set("application", value);
    localStorage.filtersApplication = filters.get("application");

    return this.setState({ filters });
  }

  filterClosedToggle() {
    const filters = new Map([...this.state.filters]);

    filters.set("closed", !this.state.filters.get("closed"));
    localStorage.filtersClosed = filters.get("closed");

    this.setState({ filters });
  }

  async deleteReport(event) {
    const headers = new Headers({ authorization });
    const index = Number(event.target.closest("tr").dataset.index);
    const { id } = this.state.reports.get(index);
    const options = { headers, method: "DELETE" };
    const reports = new Map([...this.state.reports]);

    try {
      await fetch(`/reports/${id}`, options);

      reports.delete(index);

      this.setState({ reports });
    } catch (error) {
      throw new Error(error);
    }
  }

  showMoreReports() {
    this.setState({ limit: this.state.limit + this.state.step });
  }

  async showReportDetails(event) {
    const index = Number(event.target.closest("tr").dataset.index);

    if (this.state.selected === index) {
      this.setState({ selected: null });
    } else {
      this.setState({ selected: index });
    }
  }

  async toggleReportStatus(event) {
    const headers = new Headers({ authorization });
    const index = Number(event.target.closest("tr").dataset.index);
    const { id } = this.state.reports.get(index);
    const options = { headers, method: "PATCH" };
    const reports = new Map([...this.state.reports]);

    reports.get(index).open = !reports.get(index).open;
    reports.get(index).closed_at = new Date();

    try {
      const response = await fetch(`/reports/${id}`, options);
      const report = await response.json();

      reports.get(index).open = report.open;
      reports.get(index).closed_at = report.closed_at;

      this.setState({ reports });
    } catch (error) {
      throw new Error(error);
    }
  }

  render(props, state) {
    return preact.h(
      "div",
      { class: "container" },
      preact.h(
        "header",
        null,
        preact.h(
          FilterClosed,
          Object.assign({}, state, { onChange: this.filterClosedToggle })
        ),
        preact.h(
          FilterApplication,
          Object.assign({}, state, {
            onChange: this.filterApplicationToggle,
          })
        )
      ),
      preact.h(
        "main",
        null,
        preact.h(
          ReportsTable,
          Object.assign({}, state, {
            deleteReport: this.deleteReport,
            showMoreReports: this.showMoreReports,
            showReportDetails: this.showReportDetails,
            toggleReportStatus: this.toggleReportStatus,
          })
        )
      ),
      preact.h("aside", null, preact.h(ReportDetails, Object.assign({}, state)))
    );
  }
}

preact.render(preact.h(App), document.body);
