export function getCallerPosition(stackIndex: number = 1) {
    const err = new Error()
    // this is bun specific (0.5.8)
    const stackString = err.stack.split("\n")
    const [fullLine, functionName, filePath, line, column] = stackString[stackIndex].match(/([^@]+)@(.+?):(\d+):(\d+)/)
    return {functionName, filePath, line: Number(line), column: Number(column)}
}
