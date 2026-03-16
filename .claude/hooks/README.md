# .claude/hooks/README.md

변경 전 체크리스트. 모델은 기억 못하지만 훅은 기억한다.

---

## hook: engine-change
**트리거**: `src/lib/engine/` 파일 수정 전

```
[ ] qualityScore 수식 바꾸는가?
    → 밸런스 3케이스 테스트 필수
       1) TRENDING_UP + LONG (정배열)
       2) VOLATILE + HOLD (안전 회피)
       3) 손절 미설정 + LONG + liqZone 진입 (최악)

[ ] RewardPacket 구조 바꾸는가?
    → rosterStore.applyRewards() 시그니처 동시 수정

[ ] 새 OutcomeType 추가하는가?
    → RESOLVE UI 라벨/색상 테이블에 동시 추가

[ ] 난수를 결과 판정에 넣는가?
    → 금지. 동일 입력 = 동일 출력 유지
```

---

## hook: memory-write
**트리거**: `src/lib/services/memory/` 파일 수정 또는 writeback 경로 추가 전

```
[ ] reflectionService 외 경로에서 write() 호출하는가?
    → 금지

[ ] 배틀 resolve 완료 전에 write() 호출하는가?
    → 금지. RESOLVE 상태 완료 후에만 허용

[ ] futureCandles 데이터가 메모리 카드에 포함되는가?
    → 금지. RAG에 미래 데이터 누출 = 평가 오염

[ ] 플레이어가 reflection 스킵 시 카드 생성하는가?
    → 금지. 의도적 설계.
```

---

## hook: route-logic
**트리거**: `src/routes/` 파일에 로직 추가 전

```
[ ] 스토어에 있어야 하는 로직인가?   → 스토어로 이동
[ ] 서비스에 있어야 하는 로직인가?   → 서비스로 이동
[ ] 라우트 허용 범위: UI 바인딩 + 스토어 메서드 호출만
```

---

## hook: validate
**트리거**: 코드 변경 완료 후 항상

```bash
npm run check   # 타입 에러 0개
npm run build   # 빌드 성공
```
