/* global fetch Headers localStorage preact */
import FilterApplication from '/client/filter-application.js'
import FilterClosed from '/client/filter-closed.js'
import ReportDetails from '/client/report-details.js'
import ReportsTable from '/client/reports-table.js'

const authorization = `Basic ${document.cookie.split('=')[1]}`

export default class App extends preact.Component {
	constructor () {
		super()

		this.state = {
			applications: new Set(['']),
			filters: new Map([['application', ''], ['closed', true]]),
			limit: 50,
			reports: [],
			selected: null,
			step: 50,
		}

		this.filterApplicationToggle = this.filterApplicationToggle.bind(this)
		this.filterClosedToggle = this.filterClosedToggle.bind(this)
		this.showMoreReports = this.showMoreReports.bind(this)
		this.showReportDetails = this.showReportDetails.bind(this)
		this.toggleReportStatus = this.toggleReportStatus.bind(this)
		this.deleteReport = this.deleteReport.bind(this)
	}

	async componentDidMount () {
		// Restore filters from localStorage
		if (localStorage.filtersApplication || localStorage.filtersClosed) {
			const application = localStorage.filtersApplication || ''
			let closed = localStorage.filtersClosed

			if (closed == null) closed = false
			closed = closed === 'true'

			this.setState({
				filters: new Map([['application', application], ['closed', closed]]),
			})
		}

		try {
			const headers = new Headers({authorization})
			const response = await fetch('/reports', {headers})

			if (response.status !== 200) return console.error(response)

			const reports = await response.json()
			const applications = new Set(
				reports
					.map(report => report.body._productName)
					.filter(item => item != null)
					.filter(item => item.toString().trim().length)
					.filter(item => !!item)
					.filter((item, index, array) => array.indexOf(item) === index)
					.sort()
			)

			this.setState({applications, reports})
		} catch (error) {
			throw new Error(error)
		}
	}

	filterApplicationToggle (event) {
		const filters = new Map([...this.state.filters])
		const value = event.target.value

		filters.set('application', value)
		localStorage.filtersApplication = filters.get('application')

		return this.setState({filters})
	}

	filterClosedToggle (event) {
		const filters = new Map([...this.state.filters])

		filters.set('closed', !this.state.filters.get('closed'))
		localStorage.filtersClosed = filters.get('closed')

		this.setState({filters})
	}

	async deleteReport (event) {
		const headers = new Headers({authorization})
		const index = event.target.closest('tr').dataset.index
		const id = this.state.reports[index].id
		const options = {headers, method: 'DELETE'}
		const reports = [...this.state.reports]

		try {
			await fetch(`/reports/${id}`, options)
			reports.splice(index, 1)

			this.setState({reports})
		} catch (error) {
			throw new Error(error)
		}
	}

	showMoreReports (event) {
		this.setState({limit: this.state.limit + this.state.step})
	}

	async showReportDetails (event) {
		const index = Number(event.target.closest('tr').dataset.index)

		if (this.state.selected === index) {
			this.setState({selected: null})
		} else {
			this.setState({selected: index})
		}
	}

	async toggleReportStatus (event) {
		const headers = new Headers({authorization})
		const index = event.target.closest('tr').dataset.index
		const id = this.state.reports[index].id
		const options = {headers, method: 'PATCH'}
		const reports = [...this.state.reports]

		reports[index].open = !reports[index].open
		reports[index].closed_at = new Date()

		try {
			const response = await fetch(`/reports/${id}`, options)
			const report = await response.json()

			reports[index].open = report.open
			reports[index].closed_at = report.closed_at

			this.setState({reports})
		} catch (error) {
			throw new Error(error)
		}
	}

	render (props, state) {
		return preact.h(
			'div',
			{class: 'container'},
			preact.h(
				'header',
				null,
				preact.h(FilterClosed, {
					filter: state.filters.get('closed'),
					onChange: this.filterClosedToggle,
				}),
				preact.h(FilterApplication, {
					applications: state.applications,
					filter: state.filters.get('application'),
					onChange: this.filterApplicationToggle,
				})
			),
			preact.h(
				'main',
				null,
				preact.h(ReportsTable, {
					applications: state.applications,
					deleteReport: this.deleteReport,
					filters: state.filters,
					limit: state.limit,
					reports: state.reports,
					selected: state.selected,
					showMoreReports: this.showMoreReports,
					showReportDetails: this.showReportDetails,
					toggleReportStatus: this.toggleReportStatus,
				})
			),
			preact.h(
				'aside',
				null,
				preact.h(ReportDetails, {
					reports: this.state.reports,
					selected: this.state.selected,
				})
			)
		)
	}
}

preact.render(preact.h(App), document.body)
