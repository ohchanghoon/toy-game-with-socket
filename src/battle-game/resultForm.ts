export function resultForm(
  attackType: string,
  result: boolean,
  message: string,
  health: number,
  count?: number,
  damage?: number,
) {
  return {
    attackType,
    result,
    message,
    health,
    count,
    damage,
  };
}
