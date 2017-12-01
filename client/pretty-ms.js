// MIT License
//
// Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com)
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
// THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

// Package pretty-ms for the browser
// Refs: https://github.com/sindresorhus/pretty-ms/issues/18

// pretty-ms 3.1.0
export default (ms, opts) => {
	if (!Number.isFinite(ms)) {
		throw new TypeError('Expected a finite number')
	}

	opts = opts || {}

	if (ms < 1000) {
		const msDecimalDigits =
			typeof opts.msDecimalDigits === 'number' ? opts.msDecimalDigits : 0
		return (
			(msDecimalDigits ? ms.toFixed(msDecimalDigits) : Math.ceil(ms)) +
			(opts.verbose ? ' ' + plur('millisecond', Math.ceil(ms)) : 'ms')
		)
	}

	const ret = []

	const add = (val, long, short, valStr) => {
		if (val === 0) {
			return
		}

		const postfix = opts.verbose ? ' ' + plur(long, val) : short

		ret.push((valStr || val) + postfix)
	}

	const parsed = parseMs(ms)

	add(Math.trunc(parsed.days / 365), 'year', 'y')
	add(parsed.days % 365, 'day', 'd')
	add(parsed.hours, 'hour', 'h')
	add(parsed.minutes, 'minute', 'm')

	if (opts.compact) {
		add(parsed.seconds, 'second', 's')
		return '~' + ret[0]
	}

	const sec = (ms / 1000) % 60
	const secDecimalDigits =
		typeof opts.secDecimalDigits === 'number' ? opts.secDecimalDigits : 1
	const secFixed = sec.toFixed(secDecimalDigits)
	const secStr = opts.keepDecimalsOnWholeSeconds
		? secFixed
		: secFixed.replace(/\.0+$/, '')
	add(sec, 'second', 's', secStr)

	return ret.join(' ')
}

// irregular-plurals 1.4.0
const irregularPlurals = {
	addendum: 'addenda',
	aircraft: 'aircraft',
	alga: 'algae',
	alumna: 'alumnae',
	alumnus: 'alumni',
	amoeba: 'amoebae',
	analysis: 'analyses',
	antenna: 'antennae',
	antithesis: 'antitheses',
	apex: 'apices',
	appendix: 'appendices',
	automaton: 'automata',
	axis: 'axes',
	bacillus: 'bacilli',
	bacterium: 'bacteria',
	barracks: 'barracks',
	basis: 'bases',
	beau: 'beaux',
	bison: 'bison',
	buffalo: 'buffalo',
	bureau: 'bureaus',
	cactus: 'cacti',
	calf: 'calves',
	carp: 'carp',
	census: 'censuses',
	chassis: 'chassis',
	cherub: 'cherubim',
	child: 'children',
	château: 'châteaus',
	cod: 'cod',
	codex: 'codices',
	concerto: 'concerti',
	corpus: 'corpora',
	crisis: 'crises',
	criterion: 'criteria',
	curriculum: 'curricula',
	datum: 'data',
	deer: 'deer',
	diagnosis: 'diagnoses',
	die: 'dice',
	dwarf: 'dwarfs',
	echo: 'echoes',
	elf: 'elves',
	elk: 'elk',
	ellipsis: 'ellipses',
	embargo: 'embargoes',
	emphasis: 'emphases',
	erratum: 'errata',
	'faux pas': 'faux pas',
	fez: 'fezes',
	firmware: 'firmware',
	fish: 'fish',
	focus: 'foci',
	foot: 'feet',
	formula: 'formulae',
	fungus: 'fungi',
	gallows: 'gallows',
	genus: 'genera',
	goose: 'geese',
	graffito: 'graffiti',
	grouse: 'grouse',
	half: 'halves',
	hero: 'heroes',
	hoof: 'hooves',
	hovercraft: 'hovercraft',
	hypothesis: 'hypotheses',
	index: 'indices',
	kakapo: 'kakapo',
	knife: 'knives',
	larva: 'larvae',
	leaf: 'leaves',
	libretto: 'libretti',
	life: 'lives',
	loaf: 'loaves',
	locus: 'loci',
	louse: 'lice',
	man: 'men',
	matrix: 'matrices',
	means: 'means',
	medium: 'media',
	memorandum: 'memoranda',
	millennium: 'millennia',
	minutia: 'minutiae',
	moose: 'moose',
	mouse: 'mice',
	nebula: 'nebulae',
	nemesis: 'nemeses',
	neurosis: 'neuroses',
	news: 'news',
	nucleus: 'nuclei',
	oasis: 'oases',
	offspring: 'offspring',
	opus: 'opera',
	ovum: 'ova',
	ox: 'oxen',
	paralysis: 'paralyses',
	parenthesis: 'parentheses',
	person: 'people',
	phenomenon: 'phenomena',
	phylum: 'phyla',
	pike: 'pike',
	polyhedron: 'polyhedra',
	potato: 'potatoes',
	prognosis: 'prognoses',
	quiz: 'quizzes',
	radius: 'radii',
	referendum: 'referenda',
	salmon: 'salmon',
	scarf: 'scarves',
	self: 'selves',
	series: 'series',
	sheep: 'sheep',
	shelf: 'shelves',
	shrimp: 'shrimp',
	spacecraft: 'spacecraft',
	species: 'species',
	spectrum: 'spectra',
	squid: 'squid',
	stimulus: 'stimuli',
	stratum: 'strata',
	swine: 'swine',
	syllabus: 'syllabi',
	symposium: 'symposia',
	synopsis: 'synopses',
	synthesis: 'syntheses',
	tableau: 'tableaus',
	that: 'those',
	thesis: 'theses',
	thief: 'thieves',
	this: 'these',
	tomato: 'tomatoes',
	tooth: 'teeth',
	trout: 'trout',
	tuna: 'tuna',
	vertebra: 'vertebrae',
	vertex: 'vertices',
	veto: 'vetoes',
	vita: 'vitae',
	vortex: 'vortices',
	watercraft: 'watercraft',
	wharf: 'wharves',
	wife: 'wives',
	wolf: 'wolves',
	woman: 'women',
}

// parse-ms 1.0.1
function parseMs (ms) {
	if (typeof ms !== 'number') {
		throw new TypeError('Expected a number')
	}

	var roundTowardZero = ms > 0 ? Math.floor : Math.ceil

	return {
		days: roundTowardZero(ms / 86400000),
		hours: roundTowardZero(ms / 3600000) % 24,
		minutes: roundTowardZero(ms / 60000) % 60,
		seconds: roundTowardZero(ms / 1000) % 60,
		milliseconds: roundTowardZero(ms) % 1000,
	}
}

// plur 2.1.2
function plur (str, plural, count) {
	if (typeof plural === 'number') {
		count = plural
	}

	if (str in irregularPlurals) {
		plural = irregularPlurals[str]
	} else if (typeof plural !== 'string') {
		plural = (
			str.replace(/(?:s|x|z|ch|sh)$/i, '$&e').replace(/([^aeiou])y$/i, '$1ie') +
			's'
		).replace(/i?e?s$/i, function (m) {
			var isTailLowerCase = str.slice(-1) === str.slice(-1).toLowerCase()
			return isTailLowerCase ? m.toLowerCase() : m.toUpperCase()
		})
	}

	return count === 1 ? str : plural
}
