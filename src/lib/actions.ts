/* eslint-disable no-param-reassign */
export function datetime(
  node: HTMLElement,
  [value, opts]: [value: Date, opts: Intl.DateTimeFormatOptions],
) {
  const dtFormatter = new Intl.DateTimeFormat([], opts);
  const format = (val: Date) => dtFormatter.format(val);

  node.innerText = format(value);

  return {
    update([updatedValue]: [updatedValue: Date]) {
      node.innerText = format(updatedValue);
    },
  };
}

export function quid(node: HTMLElement, value: number) {
  const format = (val: number) => (val >= 0 ? `£${val}` : `-£${Math.abs(val)}`);

  node.innerText = format(value);

  return {
    update(updatedValue: number) {
      node.innerText = format(updatedValue);
    },
  };
}
