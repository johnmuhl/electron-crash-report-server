/* global preact */
import prettyMs from '/client/pretty-ms.js'

export default function ReportDetails (props) {
	if (props.selected == null) return null

	const report = props.reports.get(props.selected)

	return preact.h(
		'div',
		{class: 'report'},
		preact.h(
			'div',
			{class: 'timestamp'},
			preact.h('img', {
				alt: 'Created at',
				src: '/ic_access_time_black_18px.svg',
			}),
			new Date(report.created_at).toString()
		),
		report.closed_at &&
			preact.h(
				'div',
				{class: 'timestamp'},
				preact.h('img', {
					alt: 'Closed at',
					src: '/ic_watch_later_black_18px.svg',
				}),
				new Date(report.closed_at).toString()
			),
		preact.h(
			'div',
			{class: 'timestamp'},
			preact.h('img', {
				alt: 'Open for',
				src: '/ic_timer_black_18px.svg',
			}),
			reportLifetime(report)
		),
		preact.h('pre', null, JSON.stringify(report.body, null, 2))
	)
}

function reportLifetime (report) {
	const closed = new Date(report.closed_at || Date.now())
	const created = new Date(report.created_at)
	let duration = prettyMs(closed - created)

	if (duration.split(' ').length === 1) return duration

	duration = duration.replace(/\s\d+[.\d]+s$/, '')

	return duration
}
