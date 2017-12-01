/* global preact, PropTypes */
export default function FilterClosed (props) {
	return preact.h(
		'div',
		null,
		preact.h(
			'label',
			null,
			preact.h('input', {
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
