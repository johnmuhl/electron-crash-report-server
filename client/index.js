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
			reports: new Map(),
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

			const json = await response.json()
			const reports = new Map(json.map(r => [r.id, r]))
			const applications = new Set(
				json
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
		const index = Number(event.target.closest('tr').dataset.index)
		const id = this.state.reports.get(index).id
		const options = {headers, method: 'DELETE'}
		const reports = new Map([...this.state.reports])

		try {
			await fetch(`/reports/${id}`, options)

			reports.delete(index)

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
		const index = Number(event.target.closest('tr').dataset.index)
		const id = this.state.reports.get(index).id
		const options = {headers, method: 'PATCH'}
		const reports = new Map([...this.state.reports])

		reports.get(index).open = !reports.get(index).open
		reports.get(index).closed_at = new Date()

		try {
			const response = await fetch(`/reports/${id}`, options)
			const report = await response.json()

			reports.get(index).open = report.open
			reports.get(index).closed_at = report.closed_at

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
				preact.h(FilterClosed, {...state, onChange: this.filterClosedToggle}),
				preact.h(FilterApplication, {
					...state,
					onChange: this.filterApplicationToggle,
				})
			),
			preact.h(
				'main',
				null,
				preact.h(ReportsTable, {
					...state,
					deleteReport: this.deleteReport,
					showMoreReports: this.showMoreReports,
					showReportDetails: this.showReportDetails,
					toggleReportStatus: this.toggleReportStatus,
				})
			),
			preact.h('aside', null, preact.h(ReportDetails, {...state}))
		)
	}
}

preact.render(preact.h(App), document.body)
