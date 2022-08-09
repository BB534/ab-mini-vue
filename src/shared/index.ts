export const extend = Object.assign
export const isObject = (val: any) => {
  return val !== null && typeof val === 'object'
}


export const hasChanged = (newvalue: any, value: any) => {
  return !Object.is(newvalue, value)
}

export const hasOwn = (target, key) => Object.getOwnPropertyDescriptor(target, key)