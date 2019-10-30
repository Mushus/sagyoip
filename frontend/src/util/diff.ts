export const diffArray = <T>(
  before: Array<T>,
  after: Array<T>,
  compareFunc = (a: T, b: T) => a === b,
): { added: Array<T>; deleted: Array<T> } => {
  const added = before.filter(b => !after.find(a => compareFunc(a, b)));
  const deleted = after.filter(a => !before.find(b => compareFunc(a, b)));
  return { added, deleted };
};
