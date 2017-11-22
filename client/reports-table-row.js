import PropTypes from 'prop-types'
import React from 'react'

export default function ReportsTableRow (props) {
	const application = props.filters.application
	const showClosed = props.filters.closed
	const report = props.report

	// filter by selected application
	if (application && report.body._productName !== application) return null
	// filter by open status
	if (!showClosed && !report.open) return null

	return (
		<tr
			data-index={props.index}
			className={props.index === props.selected ? 'active' : null}
		>
			<td>
				<button onClick={props.showDetails} className="details">
					<img
						alt={`View report ${report.id}`}
						src="/ic_open_in_new_black_24px.svg"
					/>
					{report.id}
				</button>
			</td>
			<td>
				<button
					className={report.open ? 'open' : 'closed'}
					onClick={props.toggleStatus}
				>
					{report.open ? 'Open' : 'Closed'}
				</button>
			</td>
			{props.applications.length > 1 && <td>{report.body._productName}</td>}
			<td>{report.body._version}</td>
			<td>{report.body.ver}</td>
			<td>{report.body.platform}</td>
			<td>{report.body.process_type}</td>
			<td>
				<a href={`/reports/${report.id}/dump`} className="button icon download">
					<img
						alt={`Download minidump ${report.id}`}
						src="/ic_file_download_white_24px.svg"
					/>
				</a>
			</td>
			<td onClick={props.deleteReport}>
				<button onClick={props.deleteReport} className="icon delete">
					<img
						alt={`Delete report ${report.id}`}
						src="/ic_delete_forever_white_24px.svg"
					/>
				</button>
			</td>
		</tr>
	)
}

ReportsTableRow.propTypes = {
	applications: PropTypes.array,
	filters: PropTypes.object,
	index: PropTypes.number,
	report: PropTypes.object,
	selected: PropTypes.number,
	showDetails: PropTypes.func,
	toggleStatus: PropTypes.func,
	deleteReport: PropTypes.func,
}
