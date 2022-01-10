export function numberCompareFn(a: number, b: number, asc: boolean) {
  return asc ? a - b : b - a;
}

export function stringCompareFn(a: string, b: string, asc: boolean) {
  return asc ? a.localeCompare(b) : b.localeCompare(a);
}
