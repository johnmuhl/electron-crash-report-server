/* global preact, PropTypes */
export default function FilterApplication (props) {
	if (props.applications.length === 1) return null

	return preact.h(
		'div',
		null,
		preact.h(
			'select',
			{
				value: props.filter,
				onChange: props.onChange,
			},
			preact.h('option', {value: ''}, 'Show all'),
			props.applications.map((value, key) =>
				preact.h('option', {key, value}, value)
			)
		)
	)
}

FilterApplication.propTypes = {
	applications: PropTypes.array,
	filter: PropTypes.string,
	onChange: PropTypes.func,
}
