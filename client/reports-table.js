import PropTypes from 'prop-types'
import React from 'react'
import ReportsTableRow from './reports-table-row.js'

export default function ReportsTable (props) {
	return (
		<table>
			<thead>
				<tr>
					<th>ID</th>
					<th>Status</th>
					{props.applications.length > 1 && <th>Application</th>}
					<th>Version</th>
					<th>Electron</th>
					<th>Platform</th>
					<th>Process</th>
					<th>Minidump</th>
					<th>Delete</th>
				</tr>
			</thead>
			<tbody>
				{props.reports.map((item, index) => (
					<ReportsTableRow
						key={index}
						applications={props.applications}
						filters={props.filters}
						index={index}
						report={item}
						selected={props.selected}
						showDetails={props.showReportDetails}
						toggleStatus={props.toggleReportStatus}
						deleteReport={props.deleteReport}
					/>
				))}
			</tbody>
		</table>
	)
}

ReportsTable.propTypes = {
	applications: PropTypes.array,
	filters: PropTypes.object,
	reports: PropTypes.array,
	selected: PropTypes.number,
	showReportDetails: PropTypes.func,
	toggleReportStatus: PropTypes.func,
	deleteReport: PropTypes.func,
}
