export type PeekablePromiseType<T> = Promise<T> & {
    isPending: boolean,
    isRejected: boolean,
    isFulfilled: boolean,
}

export default function makePeekablePromise<T>(executor: (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void): PeekablePromiseType<T> {
    let isPending: boolean = true
    let isRejected: boolean = false
    let isFulfilled: boolean = false


    const promise = new Promise((resolve, reject) => {
        executor(value => {
            isFulfilled = true
            isPending = false
            resolve(value)
        }, error => {
            isRejected = true
            isPending = false
            reject(error)
        })
    }) as PeekablePromiseType<T>

    Object.assign(promise, {
        isPending() {
            return isPending
        },
        isRejected() {
            return isRejected
        },
        isFulfilled() {
            return isFulfilled
        },
    })

    return promise
}
