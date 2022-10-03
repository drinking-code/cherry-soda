export function findElement(path) {
    if (!path)
        throw Error('Couldn\'t determine path of ref. Did you forget to assign?')
    let element = document.body.children
    path.forEach(index => {
        element = element[index]
    })
    return element
}

// todo: watch for changes in the dom in order to find the right element after dom mutations
