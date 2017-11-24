import PropTypes from 'prop-types'
import {h} from 'preact' // eslint-disable-line no-unused-vars

export default function FilterApplication (props) {
	if (props.applications.length === 1) return null

	return (
		<div>
			<select value={props.filter} onChange={props.onChange}>
				<option value="">Show all</option>
				{props.applications.map((item, index) => (
					<option key={index} value={item}>
						{item}
					</option>
				))}
			</select>
		</div>
	)
}

FilterApplication.propTypes = {
	applications: PropTypes.array,
	filter: PropTypes.string,
	onChange: PropTypes.func,
}
