export function can(name: string, privilage: {name: string, menu: string|null}[]) {
    return privilage.find((value) => value.name == name)
}