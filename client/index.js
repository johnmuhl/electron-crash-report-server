/* global fetch Headers */
import moment from 'moment'
import React from 'react'
import {render} from 'react-dom'

class App extends React.Component {
	constructor (props) {
		super(props)

		this.state = {
			auth: `Basic ${document.cookie.split('=')[1]}`,
			active: null,
			reports: [],
		}

		this.showReportDetails = this.showReportDetails.bind(this)
		this.toggleReportStatus = this.toggleReportStatus.bind(this)
		this.deleteReport = this.deleteReport.bind(this)
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

	async showReportDetails (event) {
		const headers = new Headers({authorization: this.state.auth})
		const index = event.target.closest('tr').dataset.index
		const id = this.state.reports[index].id
		const options = {headers, method: 'GET'}

		try {
			const response = await fetch(`/reports/${id}`, options)
			const report = await response.json()

			console.log(report)
		} catch (error) {
			throw new Error(error)
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

	render () {
		return (
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
						return (
							<tr key={index} data-index={index}>
								<td>
									<div
										onClick={this.showReportDetails}
										className="report details link"
									>
										{report.id}
										<img
											alt={`View report ${report.id}`}
											src="/ic_open_in_new_black_24px.svg"
										/>
									</div>
								</td>
								<td onClick={this.toggleReportStatus}>
									<div className={toggleBtnClassName(report.open)}>
										{report.open ? 'Close' : 'Open'}
									</div>
								</td>
								<td>{moment(report.created_at).fromNow()}</td>
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
		)
	}
}

function toggleBtnClassName (open) {
	return open ? 'btn close' : 'btn open'
}

render(<App />, document.getElementById('root'))
