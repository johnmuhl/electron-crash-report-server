export default function () {
	return `Basic ${document.cookie.split('=')[1]}`
}
