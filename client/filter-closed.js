import PropTypes from 'prop-types'
import React from 'react'

export default function FilterClosed (props) {
	return (
		<div>
			<label>
				<input
					checked={props.filter}
					onChange={props.onChange}
					type="checkbox"
				/>
				Show closed reports?
			</label>
		</div>
	)
}

FilterClosed.propTypes = {
	filter: PropTypes.bool,
	onChange: PropTypes.func,
}
