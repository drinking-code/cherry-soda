import path from 'path'

import {filterObject, mapObject, mapObjectToArray} from '../utils/iterate-object'
import serveStatic from '../server/serve-static'
import {roundToDecimal} from '../utils/round'

export type MarkerKeyType = 'parser' | 'asset-collector' | 'template' | 'client-scripts' | 'bundler'
export type StartEndType = 'start' | 'end'

const measurements: { [key: MarkerKeyType | string]: { [marker: StartEndType | string]: number } } = {}
process.env.INTERNAL_DEV = 'false'

export function addMarker(key: MarkerKeyType, marker: StartEndType | string) {
    if (process.env.INTERNAL_DEV !== 'true') return
    const time = performance.now()
    if (!measurements[key])
        measurements[key] = {}
    measurements[key][marker] = time
}

export function addRange(key: MarkerKeyType, label: string, startEnd: StartEndType) {
    if (process.env.INTERNAL_DEV !== 'true') return
    const time = performance.now()
    if (!measurements[key])
        measurements[key] = {}
    measurements[key][label + '-' + startEnd] = time
}

if (process.env.INTERNAL_DEV === 'true') {
    const serveStaticListener = serveStatic(path.resolve('src', 'compiler', 'profiler'))
    Bun.serve({
        port: 3001,
        async fetch(req) {
            const res: Response = await serveStaticListener(req)
            if (res.status < 400) return res
            const measurementValues = mapObjectToArray(measurements, ([label, measurementsOfCategory]) => {
                return mapObjectToArray(measurementsOfCategory, ([marker, measurement]) => measurement)
            }).flat()
            const earliestMeasurement = Math.min(...measurementValues)
            const latestMeasurement = Math.max(...measurementValues)
            const totalTimeDelta = latestMeasurement - earliestMeasurement
            const getGlobalPercentage = time => (time - earliestMeasurement) / totalTimeDelta
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
                const startPercentage = getGlobalPercentage(startMeasurement) * 100
                const endMeasurement = measurementsOfCategory['end']
                const endPercentage = getGlobalPercentage(endMeasurement) * 100
                const measurementDelta = endMeasurement - startMeasurement
                const getLocalPercentage = time => (time - startMeasurement) / measurementDelta
                const additionalMarkers = filterObject(measurementsOfCategory, ([marker, value]) =>
                    !['start', 'end'].includes(marker) && !marker.endsWith('-start') && !marker.endsWith('-end')
                )
                const ranges = filterObject(measurementsOfCategory, ([marker, value]) =>
                    !['start', 'end'].includes(marker) && (marker.endsWith('-start') || marker.endsWith('-end'))
                )
                const concatenatedRanges = mapObject(
                    filterObject(ranges, ([marker, value]) => marker.endsWith('-start')),
                    ([marker, value]) => {
                        const markerStem = marker.replace(/-start$/, '')
                        return [markerStem, [value, ranges[markerStem + '-end']]]
                    }
                )
                return [`<span>${label}</span>`,
                    `<div class="time-wrapper">
                    <div class="time-main" style="left:${startPercentage}%;right:${100 - endPercentage}%">
                        <div class="time-ranges">
                            ${mapObjectToArray(concatenatedRanges, ([marker, [start, end]]) =>
                                `<div class="time-range" style="margin-left:${getLocalPercentage(start) * 100}%;margin-right:${100 - getLocalPercentage(end) * 100}%">
                                    <span>${marker}</span>
                                    <span class="time-range-label">${roundToDecimal(end - start, 2)} ms</span>
                                </div>`
                            ).join('')}
                        </div>
                        <span class="time-main-label">${roundToDecimal(measurementDelta, 2)}ms</span>
                        ${mapObjectToArray(additionalMarkers, ([marker, measurement]) =>
                            `<div class="time-marker" style="left:${getLocalPercentage(measurement) * 100}%">
                                <span>${marker}</span>
                            </div>`
                        ).join('')}
                    </div>
                </div>`
                ].join('')
            }).join('')}
    </figure>
</body>
</html>
`, {headers: {'Content-Type': 'text/html; charset=utf-8',}})
        }
    })
}
