let resolveBundlerReadyPromise
const bundlerReadyPromise = new Promise(res => resolveBundlerReadyPromise = res)

export function getBundlerReadyPromise() {
    return bundlerReadyPromise
}
export {resolveBundlerReadyPromise}
