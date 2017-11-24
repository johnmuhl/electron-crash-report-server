import prettyMs from 'pretty-ms'
import PropTypes from 'prop-types'
import {h} from 'preact' // eslint-disable-line no-unused-vars

export default function ReportDetails (props) {
	if (props.selected == null) return null

	const report = props.reports[props.selected]

	return (
		<div className="report">
			<div className="timestamp">
				<img alt="Created at" src="/ic_access_time_black_18px.svg" />
				{new Date(report.created_at).toString()}
			</div>

			{report.closed_at && (
				<div className="timestamp">
					<img alt="Closed at" src="/ic_watch_later_black_18px.svg" />
					{new Date(report.closed_at).toString()}
				</div>
			)}

			<div className="timestamp">
				<img alt="Open for" src="/ic_timer_black_18px.svg" />
				{reportLifetime(report)}
			</div>

			<pre>{JSON.stringify(report.body, null, 2)}</pre>
		</div>
	)
}

ReportDetails.propTypes = {
	reports: PropTypes.array,
	selected: PropTypes.number,
}

function reportLifetime (report) {
	const closed = new Date(report.closed_at || Date.now())
	const created = new Date(report.created_at)
	let duration = prettyMs(closed - created) // .replace(/\s\d+.*s/, '')

	if (duration.split(' ').length === 1) return duration

	duration = duration.replace(/\s\d+[.\d]+s$/, '')

	return duration
}
