# skill: spec-update

문서를 고칠 때 "어디를 authority로 보고 어떤 순서로 수정할지" 정하는 절차다.

## Authority Order

1. `docs/MASTER_GAME_SPEC.md`
   - 제품 정의와 상위 게임 진실
2. `docs/AGENT_SYSTEM_DESIGN.md`
   - 에이전트, 메모리, 훈련, 평가 루프
3. `docs/TECH_ARCHITECTURE.md`
   - 스택, 레이어, store/service ownership
4. `docs/CHART_BATTLEFIELD_RULEBOOK_v1.md`
   - 차트 전장 문법
5. `docs/design-docs/cozy-chart-feel-spec.md`
   - 렌더링 감각과 시각 방향

## Update Procedure

1. 바뀌는 사실이 어떤 문서의 소유인지 먼저 결정한다.
2. 가장 좁고 authoritative한 문서를 먼저 수정한다.
3. 다른 문서가 그 사실을 요약만 하고 있었다면 링크나 요약만 맞춘다.
4. raw import 문서는 canonical 문서 대신 수정하지 않는다.
5. 배치가 바뀌었으면 `docs/README.md`와 `CLAUDE.md` 라우팅도 같이 맞춘다.

## Guardrails

- L0인 `docs/MASTER_GAME_SPEC.md` 수정 전에는 확인을 먼저 받는다.
- 버전 파일을 새로 파지 않는다.
- changelog는 파일 내부에 남긴다.
- stable truth는 `docs/`, 작업 레시피는 `.claude/skills/`, 원본 덤프는 `docs/references/imported/`에 둔다.

## Validation

```bash
npm run docs:refresh
npm run docs:check
```

코드까지 건드렸다면 추가:

```bash
npm run check
npm run build
```
