/* global preact */
export default function ReportsTableRow (props) {
	const application = props.filters.get('application')
	const showClosed = props.filters.get('closed')
	const report = props.report[1]

	// filter by selected application
	if (application && report.body._productName !== application) return null
	// filter by open status
	if (!showClosed && !report.open) return null

	return preact.h(
		'tr',
		{
			class: report.id === props.selected ? 'active' : null,
			'data-index': report.id,
		},
		preact.h(
			'td',
			null,
			preact.h(
				'button',
				{
					class: 'details',
					onClick: props.showReportDetails,
				},
				preact.h('img', {
					alt: `View report ${report.id}`,
					src: '/ic_open_in_new_black_24px.svg',
				}),
				report.id
			)
		),
		preact.h(
			'td',
			null,
			preact.h(
				'button',
				{
					class: report.open ? 'open' : 'closed',
					onClick: props.toggleReportStatus,
				},
				report.open ? 'Open' : 'Closed'
			)
		),

		props.applications.size > 1 &&
			preact.h('td', null, report.body._productName),
		preact.h('td', null, report.body._version),
		preact.h('td', null, report.body.ver),
		preact.h('td', null, report.body.platform),
		preact.h('td', null, report.body.process_type),
		preact.h(
			'td',
			null,
			preact.h(
				'a',
				{
					class: 'button icon download',
					href: `/reports/${report.id}/dump`,
				},
				preact.h('img', {
					alt: `Download minidump ${report.id}`,
					src: '/ic_file_download_white_24px.svg',
				})
			)
		),
		preact.h(
			'td',
			null,
			preact.h(
				'button',
				{
					class: 'icon delete',
					onClick: props.deleteReport,
				},
				preact.h('img', {
					alt: `Delete report ${report.id}`,
					src: '/ic_delete_forever_white_24px.svg',
				})
			)
		)
	)
}
