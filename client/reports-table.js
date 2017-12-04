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
				props.applications.size > 1 && preact.h('th', null, 'Application'),
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
			Array.from(props.reports)
				.slice(0, props.limit)
				.map((item, index) =>
					preact.h(ReportsTableRow, {
						applications: props.applications,
						deleteReport: props.deleteReport,
						filters: props.filters,
						index: item[0],
						key: index,
						report: item,
						selected: props.selected,
						showDetails: props.showReportDetails,
						toggleStatus: props.toggleReportStatus,
					})
				)
		),
		props.reports.length > props.limit &&
			preact.h(
				'tfoot',
				null,
				preact.h(
					'tr',
					null,
					preact.h(
						'td',
						{
							colspan: props.applications.size > 1 ? 9 : 8,
						},
						preact.h(
							'button',
							{
								class: 'more',
								onClick: props.showMoreReports,
							},
							'Load more'
						)
					)
				)
			)
	)
}

ReportsTable.propTypes = {
	applications: PropTypes.array,
	deleteReport: PropTypes.func,
	filters: PropTypes.object,
	reports: PropTypes.array,
	selected: PropTypes.number,
	showMoreReports: PropTypes.func,
	showReportDetails: PropTypes.func,
	toggleReportStatus: PropTypes.func,
}
