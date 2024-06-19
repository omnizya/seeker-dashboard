export function paginate(
  array: string | any[],
  pageSize: number,
  pageNumber: number
) {
  return array.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
}
