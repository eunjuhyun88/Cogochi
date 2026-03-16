# Legacy Doc Audit

| Location | Kind | Value | Severity |
| --- | --- | --- | --- |
| `CLAUDE.md` | broken-ref | `docs/README.md                canonical doc router

docs/
  MASTER_GAME_SPEC.md        L0 진실 소스. 충돌 시 이 파일이 이긴다.
  AGENT_SYSTEM_DESIGN.md     L1 에이전트 시스템 (RAG, 훈련, 평가 루프)
  TECH_ARCHITECTURE.md       L1 스택 + 레이어 + 스토어 + 서비스
  BATTLEFIELD_DESIGN.md      L1 차트→게임 번역 규칙, 전투 문법
  VISUAL_WORLD_DESIGN.md     L1 렌더링 구조, 좌표계, UI 레이아웃
  SYSTEM_INTENT.md           운영/툴체인 호환용 압축 intent 레이어
  PRODUCT_SENSE.md           운영/툴체인 호환용 압축 heuristic 레이어

src/
  routes/                    프론트엔드 페이지 (` | fail |
| `docs/AGENT_SYSTEM_DESIGN.md` | broken-ref | `src/routes/boss/[bossId]/+page.svelte` | fail |
| `docs/AGENT_SYSTEM_DESIGN.md` | broken-ref | `src/routes/camp/+page.svelte` | fail |
| `docs/AGENT_SYSTEM_DESIGN.md` | broken-ref | `src/routes/cogochi/[id]/+page.svelte` | fail |
| `docs/AGENT_SYSTEM_DESIGN.md` | broken-ref | `src/routes/zone/[zoneId]/+page.svelte` | fail |
| `docs/AGENT_WATCH_LOG.md:1002` | absolute-local-path | `/Users/ej/Downloads/files` | tracked |
| `docs/AGENT_WATCH_LOG.md:2664` | absolute-local-path | `/Users/ej/Desktop/스크린샷` | tracked |
| `docs/CHART_BATTLEFIELD_RULEBOOK_v1.md:5` | absolute-local-path | `/Users/ej/Downloads/프로젝트/Cogochi_v1/docs/BATTLEFIELD_DESIGN.md` | tracked |
| `docs/CONTEXT_ENGINEERING.md` | broken-ref | `docs/generated/agent-catalog.{md,json}` | fail |
| `docs/CONTEXT_ENGINEERING.md` | broken-ref | `docs/generated/context-registry.{md,json}` | fail |
| `docs/CONTEXT_ENGINEERING.md` | broken-ref | `docs/generated/{route-map,store-authority-map,api-group-map}.md` | fail |
| `docs/CONTEXT_ENGINEERING.md` | broken-ref | `docs/{DESIGN,ENGINEERING,PLANS,PRODUCT_SENSE,QUALITY_SCORE,RELIABILITY,SECURITY,HARNESS}.md` | fail |
| `docs/design-docs/COGOCHI_battle_screen_layout_20260316.md` | broken-ref | `src/routes/boss/[bossId]/+page.svelte` | fail |
| `docs/design-docs/COGOCHI_battle_screen_layout_20260316.md` | broken-ref | `src/routes/zone/[zoneId]/+page.svelte` | fail |
| `docs/design-docs/COGOCHI_zip_review_20260315.md:7` | absolute-local-path | `/Users/ej/Downloads/files` | tracked |
| `docs/design-docs/cozy-chart-feel-spec.md:5` | absolute-local-path | `/Users/ej/Downloads/프로젝트/Cogochi_v1/docs/VISUAL_WORLD_DESIGN.md` | tracked |
| `docs/references/imported/Cogochi_Dev_Prompt_20260308 (2).md` | broken-ref | `src/
  routes/
    +page.svelte                    # 홈 (Agent Ops Hub)
    roster/+page.svelte             # 에이전트 목록
    agent/[id]/+page.svelte         # 에이전트 상세·훈련
    team/+page.svelte               # 스쿼드 구성
    battle/+page.svelte             # 배틀 화면 진입점
    map/+page.svelte                # 월드맵
    lab/+page.svelte                # 파인튜닝 랩
  components/
    battle/
      BattleCanvas.svelte           # 3레이어 Canvas + 게임루프
      PhaseHUD.svelte               # 페이즈·라운드·OBJ 표시
      SkillMenu.svelte              # 포켓몬식 스킬 4개 메뉴
      HPBars.svelte                 # 좌우 HP 바
      MessageBox.svelte             # 하단 타이프라이터 메시지
      IntroSequence.svelte          # 배틀 시작 인트로
      ReflectionCard.svelte         # 배틀 후 결과 카드
    map/
      WorldMap.svelte               # 스테이지 노드 Canvas
      StageInfoPanel.svelte         # 하단 스테이지 정보
      DoctrineSelector.svelte       # 입장 전 독트린 선택
    agent/
      AgentCard.svelte              # 에이전트 카드 컴포넌트
      BondBar.svelte                # Bond 게이지
      XPBar.svelte                  # XP·레벨 표시
    shared/
      Banner.svelte                 # 상단 알림 배너
  lib/
    battle/
      engine.ts                     # Phase 스테이트머신
      terrain.ts                    # 캔들→지형 변환 (pY, groundAtX)
      agents.ts                     # 에이전트 이동·물리
      particles.ts                  # 파티클·이펙트·발사체
      audio.ts                      # Web Audio API 합성
      skills.ts                     # 스킬 정의·PP 관리
    ai/
      ollamaProvider.ts             # Ollama HTTP 클라이언트
      contextAssembler.ts           # 컨텍스트 조립
      reflectionService.ts          # Reflection 분류·생성
      memoryService.ts              # 메모리 CRUD
    stores/
      playerStore.svelte.ts         # 계정·리서치포인트
      rosterStore.svelte.ts         # 에이전트 목록
      squadStore.svelte.ts          # 스쿼드 구성
      battleStore.svelte.ts         # 배틀 상태 전체
      mapStore.svelte.ts            # 스테이지 진행도
    config.ts                       # 모든 수치 상수 (하드코딩 금지)
    types.ts                        # 전체 공통 타입` | fail |
| `docs/references/imported/Cogochi_Dev_Prompt_20260308 (3).md` | broken-ref | `src/
  routes/
    +page.svelte                    # 홈 (Agent Ops Hub)
    roster/+page.svelte             # 에이전트 목록
    agent/[id]/+page.svelte         # 에이전트 상세·훈련
    team/+page.svelte               # 스쿼드 구성
    battle/+page.svelte             # 배틀 화면 진입점
    map/+page.svelte                # 월드맵
    lab/+page.svelte                # 파인튜닝 랩
  components/
    battle/
      BattleCanvas.svelte           # 3레이어 Canvas + 게임루프
      PhaseHUD.svelte               # 페이즈·라운드·OBJ 표시
      SkillMenu.svelte              # 포켓몬식 스킬 4개 메뉴
      HPBars.svelte                 # 좌우 HP 바
      MessageBox.svelte             # 하단 타이프라이터 메시지
      IntroSequence.svelte          # 배틀 시작 인트로
      ReflectionCard.svelte         # 배틀 후 결과 카드
    map/
      WorldMap.svelte               # 스테이지 노드 Canvas
      StageInfoPanel.svelte         # 하단 스테이지 정보
      DoctrineSelector.svelte       # 입장 전 독트린 선택
    agent/
      AgentCard.svelte              # 에이전트 카드 컴포넌트
      BondBar.svelte                # Bond 게이지
      XPBar.svelte                  # XP·레벨 표시
    shared/
      Banner.svelte                 # 상단 알림 배너
  lib/
    battle/
      engine.ts                     # Phase 스테이트머신
      terrain.ts                    # 캔들→지형 변환 (pY, groundAtX)
      agents.ts                     # 에이전트 이동·물리
      particles.ts                  # 파티클·이펙트·발사체
      audio.ts                      # Web Audio API 합성
      skills.ts                     # 스킬 정의·PP 관리
    ai/
      ollamaProvider.ts             # Ollama HTTP 클라이언트
      contextAssembler.ts           # 컨텍스트 조립
      reflectionService.ts          # Reflection 분류·생성
      memoryService.ts              # 메모리 CRUD
    stores/
      playerStore.svelte.ts         # 계정·리서치포인트
      rosterStore.svelte.ts         # 에이전트 목록
      squadStore.svelte.ts          # 스쿼드 구성
      battleStore.svelte.ts         # 배틀 상태 전체
      mapStore.svelte.ts            # 스테이지 진행도
    config.ts                       # 모든 수치 상수 (하드코딩 금지)
    types.ts                        # 전체 공통 타입` | fail |
| `docs/references/imported/Cogochi_Dev_Prompt_20260308 (4).md` | broken-ref | `src/
  routes/
    +page.svelte                    # 홈 (Agent Ops Hub)
    roster/+page.svelte             # 에이전트 목록
    agent/[id]/+page.svelte         # 에이전트 상세·훈련
    team/+page.svelte               # 스쿼드 구성
    battle/+page.svelte             # 배틀 화면 진입점
    map/+page.svelte                # 월드맵
    lab/+page.svelte                # 파인튜닝 랩
  components/
    battle/
      BattleCanvas.svelte           # 3레이어 Canvas + 게임루프
      PhaseHUD.svelte               # 페이즈·라운드·OBJ 표시
      SkillMenu.svelte              # 포켓몬식 스킬 4개 메뉴
      HPBars.svelte                 # 좌우 HP 바
      MessageBox.svelte             # 하단 타이프라이터 메시지
      IntroSequence.svelte          # 배틀 시작 인트로
      ReflectionCard.svelte         # 배틀 후 결과 카드
    map/
      WorldMap.svelte               # 스테이지 노드 Canvas
      StageInfoPanel.svelte         # 하단 스테이지 정보
      DoctrineSelector.svelte       # 입장 전 독트린 선택
    agent/
      AgentCard.svelte              # 에이전트 카드 컴포넌트
      BondBar.svelte                # Bond 게이지
      XPBar.svelte                  # XP·레벨 표시
    shared/
      Banner.svelte                 # 상단 알림 배너
  lib/
    battle/
      engine.ts                     # Phase 스테이트머신
      terrain.ts                    # 캔들→지형 변환 (pY, groundAtX)
      agents.ts                     # 에이전트 이동·물리
      particles.ts                  # 파티클·이펙트·발사체
      audio.ts                      # Web Audio API 합성
      skills.ts                     # 스킬 정의·PP 관리
    ai/
      ollamaProvider.ts             # Ollama HTTP 클라이언트
      contextAssembler.ts           # 컨텍스트 조립
      reflectionService.ts          # Reflection 분류·생성
      memoryService.ts              # 메모리 CRUD
    stores/
      playerStore.svelte.ts         # 계정·리서치포인트
      rosterStore.svelte.ts         # 에이전트 목록
      squadStore.svelte.ts          # 스쿼드 구성
      battleStore.svelte.ts         # 배틀 상태 전체
      mapStore.svelte.ts            # 스테이지 진행도
    config.ts                       # 모든 수치 상수 (하드코딩 금지)
    types.ts                        # 전체 공통 타입` | fail |
| `docs/references/imported/Cogochi_DinoAssets_20260312.md:6` | absolute-local-path | `/Users/ej/Downloads/보관함/Topic_Review/archives/from_보관함_generic_zips/dinoCharactersVersion1.1.zip` | tracked |
