/* global fetch Headers */

import './index.css'
import authHeader from './auth-header.js'
import FilterApplication from './filter-application.js'
import FilterClosed from './filter-closed.js'
import React from 'react'
import ReportDetails from './report-details.js'
import ReportsTable from './reports-table.js'

export default class App extends React.Component {
	constructor (props) {
		super(props)

		this.state = {
			applications: [''],
			filters: {
				application: '',
				closed: true,
			},
			reports: [],
			selected: null,
		}

		this.filterApplicationToggle = this.filterApplicationToggle.bind(this)
		this.filterClosedToggle = this.filterClosedToggle.bind(this)
		this.showReportDetails = this.showReportDetails.bind(this)
		this.toggleReportStatus = this.toggleReportStatus.bind(this)
		this.deleteReport = this.deleteReport.bind(this)
	}

	async componentDidMount () {
		try {
			const headers = new Headers({authorization: authHeader()})
			const response = await fetch('/reports', {headers})

			if (response.status !== 200) return console.error(response)

			const reports = await response.json()
			const applications = reports
				.map(report => report.body._productName)
				.filter((item, index, array) => array.indexOf(item) === index)
				.sort()

			this.setState({applications, reports})
		} catch (error) {
			throw new Error(error)
		}
	}

	filterApplicationToggle (event) {
		const filters = Object.assign({}, this.state.filters)
		const index = event.target.value

		if (!index) {
			filters.application = ''
		} else {
			filters.application = this.state.applications[index]
		}

		return this.setState({filters})
	}

	filterClosedToggle (event) {
		const filters = Object.assign({}, this.state.filters)

		filters.closed = !this.state.filters.closed

		this.setState({filters})
	}

	async deleteReport (event) {
		const headers = new Headers({authorization: authHeader()})
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

	async showReportDetails (event) {
		const index = Number(event.target.closest('tr').dataset.index)

		if (this.state.selected === index) {
			this.setState({selected: null})
		} else {
			this.setState({selected: index})
		}
	}

	async toggleReportStatus (event) {
		const headers = new Headers({authorization: authHeader()})
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

	render () {
		return (
			<div className="container">
				<header>
					<FilterClosed
						filter={this.state.filters.closed}
						onChange={this.filterClosedToggle}
					/>
					<FilterApplication
						applications={this.state.applications}
						filter={this.state.filters.application}
						onChange={this.filterApplicationToggle}
					/>
				</header>
				<main>
					<ReportsTable
						filters={this.state.filters}
						reports={this.state.reports}
						selected={this.state.selected}
						showReportDetails={this.showReportDetails}
						toggleReportStatus={this.toggleReportStatus}
						deleteReport={this.deleteReport}
					/>
				</main>
				<aside>
					<ReportDetails
						reports={this.state.reports}
						selected={this.state.selected}
					/>
				</aside>
			</div>
		)
	}
}
