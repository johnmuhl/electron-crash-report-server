/* global preact */
export default function FilterClosed (props) {
	return preact.h(
		'div',
		null,
		preact.h(
			'label',
			null,
			preact.h('input', {
				checked: props.filters.get('closed'),
				onChange: props.onChange,
				type: 'checkbox',
			}),
			'Show closed reports?'
		)
	)
}
