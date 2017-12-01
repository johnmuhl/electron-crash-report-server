import PropTypes from 'prop-types'
import {h} from 'preact'

export default function ReportsTableRow (props) {
	const application = props.filters.application
	const showClosed = props.filters.closed
	const report = props.report

	// filter by selected application
	if (application && report.body._productName !== application) return null
	// filter by open status
	if (!showClosed && !report.open) return null

	return h(
		'tr',
		{
			'data-index': props.index,
			class: props.index === props.selected ? 'active' : null,
		},
		h(
			'td',
			null,
			h(
				'button',
				{onClick: props.showDetails, class: 'details'},
				h('img', {
					alt: `View report ${report.id}`,
					src: '/ic_open_in_new_black_24px.svg',
				}),
				report.id
			)
		),
		h(
			'td',
			null,
			h(
				'button',
				{
					onClick: props.toggleStatus,
					class: report.open ? 'open' : 'closed',
				},
				report.open ? 'Open' : 'Closed'
			)
		),

		props.applications.length > 1 && h('td', null, report.body._productName),
		h('td', null, report.body._version),
		h('td', null, report.body.ver),
		h('td', null, report.body.platform),
		h('td', null, report.body.process_type),
		h(
			'td',
			null,
			h(
				'a',
				{
					href: `/reports/${report.id}/dump`,
					class: 'button icon download',
				},
				h('img', {
					alt: `Download minidump ${report.id}`,
					src: '/ic_file_download_white_24px.svg',
				})
			)
		),
		h(
			'td',
			{onClick: props.deleteReport},
			h(
				'button',
				{
					onClick: props.deleteReport,
					class: 'icon delete',
				},
				h('img', {
					alt: `Delete report ${report.id}`,
					src: '/ic_delete_forever_white_24px.svg',
				})
			)
		)
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
