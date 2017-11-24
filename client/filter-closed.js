import PropTypes from 'prop-types'
import {h} from 'preact' // eslint-disable-line no-unused-vars

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
