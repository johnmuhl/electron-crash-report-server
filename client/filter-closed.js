import PropTypes from 'prop-types'
import {h} from 'preact'

export default function FilterClosed (props) {
	return h(
		'div',
		null,
		h(
			'label',
			null,
			h('input', {
				checked: props.filter,
				onChange: props.onChange,
				type: 'checkbox',
			}),
			'Show closed reports?'
		)
	)
}

FilterClosed.propTypes = {
	filter: PropTypes.bool,
	onChange: PropTypes.func,
}
