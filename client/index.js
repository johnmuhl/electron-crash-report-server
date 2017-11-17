/* global fetch Headers */
import moment from 'moment'
import PropTypes from 'prop-types'
import React from 'react'
import {render} from 'react-dom'

class App extends React.Component {
	constructor (props) {
		super(props)

		this.state = {
			auth: `Basic ${document.cookie.split('=')[1]}`,
			active: {},
			filter: false,
			reports: [],
		}

		this.deleteReport = this.deleteReport.bind(this)
		this.showReportDetails = this.showReportDetails.bind(this)
		this.toggleReportStatus = this.toggleReportStatus.bind(this)
		this.toggleViewFilter = this.toggleViewFilter.bind(this)
	}

	async componentDidMount () {
		const options = {headers: new Headers({authorization: this.state.auth})}
		const response = await fetch('/reports', options)

		if (response.status === 200) {
			const reports = await response.json()

			this.setState({reports})
		} else {
			console.error(response)
		}
	}

	async deleteReport (event) {
		const headers = new Headers({authorization: this.state.auth})
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
		const headers = new Headers({authorization: this.state.auth})
		const index = event.target.closest('tr').dataset.index
		const id = this.state.reports[index].id
		const options = {headers, method: 'GET'}

		if (this.state.active.id === id) {
			this.setState({active: {}})
		} else {
			try {
				const response = await fetch(`/reports/${id}`, options)
				const report = await response.json()

				this.setState({active: report})
			} catch (error) {
				throw new Error(error)
			}
		}
	}

	async toggleReportStatus (event) {
		const headers = new Headers({authorization: this.state.auth})
		const index = event.target.closest('tr').dataset.index
		const id = this.state.reports[index].id
		const options = {headers, method: 'PATCH'}
		const reports = [...this.state.reports]

		reports[index].open = !reports[index].open

		try {
			const response = await fetch(`/reports/${id}`, options)
			const report = await response.json()

			reports[index].active = true
			reports[index].open = report.open

			this.setState({reports})
		} catch (error) {
			throw new Error(error)
		}
	}

	toggleViewFilter (event) {
		this.setState({filter: !this.state.filter})
	}

	render () {
		return (
			<div>
				<div
					onClick={this.toggleViewFilter}
					className={toggleFilterClassName(this.state.filter)}
				>
					{this.state.filter ? 'Show all' : 'Show open'}
				</div>
				<table>
					<thead>
						<tr>
							<th>ID</th>
							<th>Status</th>
							<th>Created</th>
							<th>Version</th>
							<th>Electron</th>
							<th>Platform</th>
							<th>Process</th>
							<th>Minidump</th>
							<th>Delete</th>
						</tr>
					</thead>
					<tbody>
						{this.state.reports.map((report, index) => {
							if (this.state.filter && !report.open) return null
							return (
								<tr
									key={index}
									data-index={index}
									className={activeReportClassName(this.state.active, report)}
								>
									<td>
										<div
											onClick={this.showReportDetails}
											className="report link"
										>
											<img
												alt={`View report ${report.id}`}
												src="/ic_open_in_new_black_24px.svg"
											/>
											{report.id}
										</div>
									</td>
									<td onClick={this.toggleReportStatus}>
										<div className={toggleBtnClassName(report.open)}>
											{report.open ? 'Open' : 'Closed'}
										</div>
									</td>
									<td className="truncate">
										{moment(report.created_at).fromNow()}
									</td>
									<td>{report.body._version}</td>
									<td>{report.body.ver}</td>
									<td>{report.body.platform}</td>
									<td>{report.body.process_type}</td>
									<td>
										<a
											href={`/reports/${report.id}/dump`}
											className="btn icon download"
										>
											<img
												alt={`Download minidump ${report.id}`}
												src="/ic_file_download_white_24px.svg"
											/>
										</a>
									</td>
									<td onClick={this.deleteReport}>
										<div className="btn icon delete">
											<img
												alt={`Delete report ${report.id}`}
												src="/ic_delete_forever_white_24px.svg"
											/>
										</div>
									</td>
								</tr>
							)
						})}
					</tbody>
				</table>
				<ReportDetails report={this.state.active} />
			</div>
		)
	}
}

function ReportDetails (props) {
	if (!props.report || !props.report.id) return null

	const report = props.report

	return (
		<div className="report details">
			<div className="timestamp">
				<img alt="Created at" src="/ic_access_time_black_18px.svg" />
				{report.created_at}
			</div>

			{report.closed_at && (
				<div className="timestamp">
					<img alt="Closed at" src="/ic_watch_later_black_18px.svg" />
					{report.closed_at}
				</div>
			)}

			<div className="timestamp">
				<img alt="Open for" src="/ic_timer_black_18px.svg" />
				{moment.duration(reportLifetime(report)).humanize()}
			</div>

			<pre>{JSON.stringify(report.body, null, 2)}</pre>
		</div>
	)
}

ReportDetails.propTypes = {
	report: PropTypes.object,
}

function reportLifetime (report) {
	const closed = new Date(report.closed_at || Date.now())
	const created = new Date(report.created_at)

	return closed - created
}

function activeReportClassName (active, report) {
	let className = ''

	className += active.id === report.id ? ' active ' : ''
	className += report.open ? '' : ' closed '

	return className
}

function toggleBtnClassName (open) {
	return open ? 'btn open' : 'btn close'
}

function toggleFilterClassName (filter) {
	return filter ? 'btn link filtered' : 'btn link unfiltered'
}

render(<App />, document.getElementById('root'))
