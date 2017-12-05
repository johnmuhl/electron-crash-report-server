/* global preact */
export default function FilterApplication (props) {
	if (props.applications.size === 1) return null

	return preact.h(
		'div',
		null,
		preact.h(
			'select',
			{
				onChange: props.onChange,
				value: props.filters.get('application'),
			},
			preact.h('option', {value: ''}, 'Show all'),
			Array.from(props.applications).map((value, key) =>
				preact.h('option', {key, value}, value)
			)
		)
	)
}
