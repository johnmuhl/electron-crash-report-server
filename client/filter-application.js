import PropTypes from 'prop-types'
import React from 'react'

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
