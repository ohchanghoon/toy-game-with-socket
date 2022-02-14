export class Player {
  // 기본 스탯
  attackDamage = Math.floor(Math.random() * 6) + 10;
  critChance = 0.2;
  armor = Math.floor(Math.random() * 4) + 5;
  health = Math.floor(Math.random() * 501) + 1000;
  // 스킬 갯수
  jabCnt = 10;
  chargedAttackCnt = 5;
  specialMoveCnt = 3;
  healCnt = 8;
  defenseCnt = 5;

  // 기본공격력 x 2.5, 사용가능 횟수 5
  chargedAttack() {
    if (!this.chargedAttackCnt) return false;
    this.chargedAttackCnt -= 1;
    return Math.random() < this.critChance
      ? this.attackDamage * 0.5 * 2
      : this.attackDamage * 0.5;
  }

  // 기본공격력 x 0.5 적용과 이번 공격만 크리티컬 확률 3배, 사용가능 횟수 10
  jab() {
    if (!this.jabCnt) return false;
    this.jabCnt -= 1;
    return Math.random() < 0.3
      ? this.attackDamage * 0.5 * 3
      : this.attackDamage * 0.5;
  }
}
