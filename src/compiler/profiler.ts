import path from 'path'

import {mapObjectToArray} from '../utils/iterate-object'
import serveStatic from '../server/serve-static'
import {roundToDecimal} from '../utils/round'

const measurements: { [key: MarkerKeyType]: { [marker: StartEndType | string]: number } } = {}

export type MarkerKeyType = 'parser' | 'template' | 'bundler'
export type StartEndType = 'start' | 'end'

export function addMarker(key: MarkerKeyType, marker: StartEndType) {
    const time = performance.now()
    if (!measurements[key])
        measurements[key] = {}
    measurements[key][marker] = time
}

export function addRange(key: MarkerKeyType, label: string, startEnd: StartEndType) {
    const time = performance.now()
    if (!measurements[key])
        measurements[key] = {}
    measurements[key][label + '-' + startEnd] = time
}

const serveStaticListener = serveStatic(path.resolve('src', 'compiler', 'profiler'))
Bun.serve({
    port: 3001,
    fetch(req) {
        const res: Response = serveStaticListener(req)
        if (res.status < 400) return res
        const measurementValues = mapObjectToArray(measurements, ([label, measurementsOfCategory]) => {
            return mapObjectToArray(measurementsOfCategory, ([marker, measurement]) => measurement)
        }).flat()
        const earliestMeasurement = Math.min(...measurementValues)
        const latestMeasurement = Math.max(...measurementValues)
        const totalTimeDelta = latestMeasurement - earliestMeasurement
        const getPercentage = time => (time - earliestMeasurement) / totalTimeDelta
        return new Response(`\
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8"/>
    <title>Cherry-Soda Compiler Profiler</title>
    <link rel="stylesheet" href="/styles.css">
</head>
<body>
    <h1>Cherry-Soda Compiler Profiler</h1>
    <figure class="measurements-figure">
        ${mapObjectToArray(measurements, ([label, measurementsOfCategory]) => {
            const startMeasurement = measurementsOfCategory['start']
            const startPercentage = getPercentage(startMeasurement) * 100
            const endMeasurement = measurementsOfCategory['end']
            const endPercentage = getPercentage(endMeasurement) * 100
            const measurementDelta = endMeasurement - startMeasurement
            return [`<span>${label}</span>`,
                `<div class="time-wrapper">${[
                    `<div class="time-main" style="left:${startPercentage}%;right:${100 - endPercentage}%">${
                        `<span class="time-main-label">${roundToDecimal(measurementDelta, 2)}ms</span>`
                    }</div>`
                ]}</div>`
            ].join('')
        }).join('')}
    </figure>
</body>
</html>
`, {
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
            }
        })
    }
})
