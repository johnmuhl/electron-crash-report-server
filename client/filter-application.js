/* global preact, PropTypes */
export default function FilterApplication (props) {
	if (props.applications.length === 1) return null

	return preact.h(
		'div',
		null,
		preact.h(
			'select',
			{
				onChange: props.onChange,
				value: props.filter,
			},
			preact.h('option', {value: ''}, 'Show all'),
			Array.from(props.applications).map((value, key) =>
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
