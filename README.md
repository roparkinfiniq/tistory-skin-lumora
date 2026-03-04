# tistory-skin-lumora
미니멀하고 세련된 테크 블로그용 티스토리 스킨 템플릿

# Git 사용법 (기본 코드)

## 1) 원격 최신 코드 가져오기

```bash
# 원격 저장소 최신 코드 가져오기
git pull origin main
```

## 2) 브랜치 전환

```bash
# 브랜치 목록 확인
git branch -a

# 다른 브랜치로 이동
git checkout my-feature

# 메인 브랜치로 돌아가기
git checkout main
```

## 3) 새 브랜치 생성 & 이동

```bash
# 새 브랜치 생성 후 전환
git checkout -b new-branch
```

## 4) 파일 추가 & 커밋

```bash
# 특정 파일 추가
git add 파일명

# 전체 추가
git add .

# 커밋 메시지 작성
git commit -m "설명 메시지"
```

## 5) 원격 저장소에 업로드

```bash
# 새 브랜치 최초 푸시
git push -u origin new-branch

# 이후 동일 브랜치 업데이트 푸시
git push
```

---

# 커스터마이징 가이드 (Essential Dark)

Lumora Essential Dark 스킨은 사용자 친화적인 CSS 변수화와 깔끔한 기본 테마를 제공합니다. 아래 가이드를 참고하여 블로그의 느낌을 쉽게 변경해 보세요.

## 1. 메인 포인트 컬러(Accent Color) 변경하기
본 스킨의 기본 포인트 컬러는 터미널 민트(`var(--accent-color)`, `#14b8a6`)입니다. 이를 본인만의 색상(파란색, 초록색 등)으로 바꾸고 싶다면 아래 단계를 따릅니다.

1. **`style.css` 엽니다.**
2. 파일 최상단의 `:root` 구역을 찾습니다.
3. `--accent-color`, `--accent-color-hover` 등의 값을 원하는 컬러 코드로 변경합니다. (이때, 태그, 버튼, 인용구 등 모든 요소의 색상이 동기화되어 깔끔하게 변경됩니다.)

## 2. 사이드바 카테고리 아이콘 변경하기
기본적으로 사이드바 카테고리에는 모던하고 심플한 형태 유지를 위해 **공통된 폴더 아이콘(`fa-folder`)과 포인트 컬러**가 통일되어 적용되어 있습니다. (Essential Dark의 디자인 의도)

하지만 **카테고리별로 각기 다른 아이콘과 색상**을 수동 지정하고 싶은 고급 사용자는 아래와 같이 스크립트를 수정할 수 있습니다.

1. **`images/script_v56.js` (가장 최신 버전) 엽니다.**
2. 약 340번째 줄의 `styleCategories` 함수 내 `const styles = [...]` 배열을 찾습니다.
3. 배열 내에 자신이 원하는 아이콘(폰트어썸 클래스명)과 Tailwind 색상/배경 클래스를 객체 형태로 나열합니다.
   - *작성 예시:*
   ```javascript
   const styles = [
       { icon: 'fa-laptop-code', color: 'text-blue-400 group-hover:text-blue-500', activeColor: 'text-blue-400', bg: 'bg-blue-400/10', activeBg: 'bg-blue-400/20', border: 'bg-blue-400' },
       { icon: 'fa-camera', color: 'text-green-400 group-hover:text-green-500', activeColor: 'text-green-400', bg: 'bg-green-400/10', activeBg: 'bg-green-400/20', border: 'bg-green-400' }
   ];
   ```
   *배열에 적힌 순서대로 첫 번째 카테고리부터 차례대로 스타일이 반복 적용됩니다.*
