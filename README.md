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
