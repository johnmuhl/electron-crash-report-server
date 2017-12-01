/* global preact PropTypes */
import ReportsTableRow from '/client/reports-table-row.js'

export default function ReportsTable (props) {
	return preact.h(
		'table',
		null,
		preact.h(
			'thead',
			null,
			preact.h(
				'tr',
				null,
				preact.h('th', null, 'ID'),
				preact.h('th', null, 'Status'),
				props.applications.length > 1 && preact.h('th', null, 'Application'),
				preact.h('th', null, 'Version'),
				preact.h('th', null, 'Electron'),
				preact.h('th', null, 'Platform'),
				preact.h('th', null, 'Process'),
				preact.h('th', null, 'Minidump'),
				preact.h('th', null, 'Delete')
			)
		),
		preact.h(
			'tbody',
			null,
			props.reports.map((item, index) =>
				preact.h(ReportsTableRow, {
					key: index,
					applications: props.applications,
					filters: props.filters,
					index: index,
					report: item,
					selected: props.selected,
					showDetails: props.showReportDetails,
					toggleStatus: props.toggleReportStatus,
					deleteReport: props.deleteReport,
				})
			)
		)
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
