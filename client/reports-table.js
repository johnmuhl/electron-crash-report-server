import PropTypes from 'prop-types'
import ReportsTableRow from './reports-table-row.js'
import {h} from 'preact'

export default function ReportsTable (props) {
	return h(
		'table',
		null,
		h(
			'thead',
			null,
			h(
				'tr',
				null,
				h('th', null, 'ID'),
				h('th', null, 'Status'),
				props.applications.length > 1 && h('th', null, 'Application'),
				h('th', null, 'Version'),
				h('th', null, 'Electron'),
				h('th', null, 'Platform'),
				h('th', null, 'Process'),
				h('th', null, 'Minidump'),
				h('th', null, 'Delete')
			)
		),
		h(
			'tbody',
			null,
			props.reports.map((item, index) =>
				h(ReportsTableRow, {
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
