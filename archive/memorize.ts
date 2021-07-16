export function memoize(_: any, prop: string, descriptor: PropertyDescriptor) {
  let original = descriptor.get;

  const privateProp = `__memoized_${prop}`;

  descriptor.get = function (this: { [index: string]: any }) {
    if (!this.hasOwnProperty(privateProp)) {
      Object.defineProperty(this, privateProp, {
        configurable: false,
        enumerable: false,
        writable: false,
        value: original?.apply(this),
      });
    }

    return this[privateProp];
  };
}
