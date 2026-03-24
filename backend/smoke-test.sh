#!/bin/bash
# ============================================================
#  Full API Smoke Test
#  Usage: bash smoke-test.sh [--auth TOKEN]
#
#  Without --auth: tests only public/admin endpoints
#  With --auth:    also tests authenticated user endpoints
# ============================================================

BASE="http://localhost:8080"
PASS=0
FAIL=0
ERRORS=""
AUTH_TOKEN=""

# Parse arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --auth) AUTH_TOKEN="$2"; shift 2 ;;
    *) shift ;;
  esac
done

test_api() {
  local method="$1"
  local url="$2"
  local data="$3"
  local desc="$4"

  if [ "$method" = "GET" ] || [ "$method" = "DELETE" ]; then
    status=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "$url")
  else
    status=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" \
      -H "Content-Type: application/json" -d "$data" "$url")
  fi

  if [ "$status" = "200" ]; then
    echo "  [PASS] $status  $method $desc"
    PASS=$((PASS + 1))
  else
    echo "  [FAIL] $status  $method $desc"
    FAIL=$((FAIL + 1))
    ERRORS="$ERRORS\n  [FAIL] $status  $method $desc"
  fi
}

# Authenticated request helper
test_auth_api() {
  local method="$1"
  local url="$2"
  local data="$3"
  local desc="$4"

  if [ -z "$AUTH_TOKEN" ]; then
    echo "  [SKIP]       $method $desc (no auth token)"
    return
  fi

  if [ "$method" = "GET" ] || [ "$method" = "DELETE" ]; then
    status=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" \
      -H "Authorization: Bearer $AUTH_TOKEN" "$url")
  else
    status=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $AUTH_TOKEN" -d "$data" "$url")
  fi

  if [ "$status" = "200" ]; then
    echo "  [PASS] $status  $method $desc"
    PASS=$((PASS + 1))
  else
    echo "  [FAIL] $status  $method $desc"
    FAIL=$((FAIL + 1))
    ERRORS="$ERRORS\n  [FAIL] $status  $method $desc"
  fi
}

echo ""
echo "============================================================"
echo "  Full API Smoke Test"
if [ -n "$AUTH_TOKEN" ]; then
  echo "  (Auth token provided - authenticated tests enabled)"
fi
echo "============================================================"

# ==========================================================
#  SECTION A: PUBLIC / ADMIN ENDPOINTS (no auth required)
# ==========================================================

# --------------------------------------------------
echo ""
echo "--- [1] Admin Main ---"
test_api GET "$BASE/api/admin/main" "" "/api/admin/main"
test_api GET "$BASE/api/admin/post-activity" "" "/api/admin/post-activity"

# --------------------------------------------------
echo ""
echo "--- [2] Admin Stats ---"
test_api GET "$BASE/api/admin/stats/age-distribution" "" "/stats/age-distribution"
test_api GET "$BASE/api/admin/stats/age-circle-participation" "" "/stats/age-circle-participation"
test_api GET "$BASE/api/admin/stats/circle-survival" "" "/stats/circle-survival"
test_api GET "$BASE/api/admin/stats/activity-heatmap" "" "/stats/activity-heatmap"
test_api GET "$BASE/api/admin/stats/age-category-retention" "" "/stats/age-category-retention"

# --------------------------------------------------
echo ""
echo "--- [3] Admin Users ---"
test_api GET "$BASE/api/admin/users/list?page=1&size=5" "" "/users/list (default)"
test_api GET "$BASE/api/admin/users/list?page=1&size=5&status=ACTIVE" "" "/users/list?status=ACTIVE"
test_api GET "$BASE/api/admin/users/list?page=1&size=5&gender=MALE" "" "/users/list?gender=MALE"
test_api GET "$BASE/api/admin/users/list?page=1&size=5&role=ADMIN" "" "/users/list?role=ADMIN"
test_api GET "$BASE/api/admin/users/list?page=1&size=5&keyword=test" "" "/users/list?keyword=test"
test_api GET "$BASE/api/admin/users/profile/1" "" "/users/profile/1"
test_api GET "$BASE/api/admin/users/profile/1/post?page=1&size=5" "" "/users/profile/1/post"
test_api GET "$BASE/api/admin/users/profile/1/reply?page=1&size=5" "" "/users/profile/1/reply"
test_api GET "$BASE/api/admin/users/profile/1/circle?page=1&size=5" "" "/users/profile/1/circle"

# --------------------------------------------------
echo ""
echo "--- [4] Admin Circles ---"
test_api GET "$BASE/api/admin/circles/categories" "" "/circles/categories"
test_api GET "$BASE/api/admin/circles/list?page=1&size=5" "" "/circles/list (default)"
test_api GET "$BASE/api/admin/circles/list?page=1&size=5&status=OPEN" "" "/circles/list?status=OPEN"
test_api GET "$BASE/api/admin/circles/popular-circles" "" "/circles/popular-circles"
test_api GET "$BASE/api/admin/circles/pending" "" "/circles/pending"
test_api GET "$BASE/api/admin/circles/1" "" "/circles/1 (detail)"
test_api GET "$BASE/api/admin/circles/1/members?page=1&size=5" "" "/circles/1/members"
test_api GET "$BASE/api/admin/circles/1/posts?page=1&size=5" "" "/circles/1/posts"

# --------------------------------------------------
echo ""
echo "--- [5] Admin Posts ---"
test_api GET "$BASE/api/admin/posts/list?page=1&size=5" "" "/posts/list (default)"
test_api GET "$BASE/api/admin/posts/list?page=1&size=5&boardType=FREE" "" "/posts/list?boardType=FREE"
test_api GET "$BASE/api/admin/posts/list?page=1&size=5&boardType=NOTICE" "" "/posts/list?boardType=NOTICE"
test_api GET "$BASE/api/admin/posts/list?page=1&size=5&deleted=true" "" "/posts/list?deleted=true"
test_api GET "$BASE/api/admin/posts/1" "" "/posts/1 (detail)"

# --------------------------------------------------
echo ""
echo "--- [6] Admin Places ---"
test_api GET "$BASE/api/admin/places/list?page=1&size=5" "" "/places/list (default)"
test_api GET "$BASE/api/admin/places/1" "" "/places/1 (detail)"
test_api GET "$BASE/api/admin/places/1/closed-days" "" "/places/1/closed-days"

# --------------------------------------------------
echo ""
echo "--- [7] Admin Logs ---"
test_api GET "$BASE/api/admin/logs/list?page=1&size=5" "" "/logs/list"
test_api GET "$BASE/api/admin/logs/users/1/logs?page=1&size=5" "" "/logs/users/1/logs"

# --------------------------------------------------
echo ""
echo "--- [8] Admin Reports ---"
test_api GET "$BASE/api/admin/reports/list?page=1&size=5" "" "/reports/list (default)"
test_api GET "$BASE/api/admin/reports/list?page=1&size=5&status=PENDING" "" "/reports/list?status=PENDING"
test_api GET "$BASE/api/admin/reports/list?page=1&size=5&targetType=POST" "" "/reports/list?targetType=POST"
test_api GET "$BASE/api/admin/reports/1" "" "/reports/1"

# --------------------------------------------------
echo ""
echo "--- [9] Admin Sanctions ---"
test_api GET "$BASE/api/admin/sanctions/list?page=1&size=5" "" "/sanctions/list (default)"
test_api GET "$BASE/api/admin/sanctions/list?page=1&size=5&sanctionState=ACTIVE" "" "/sanctions/list?sanctionState=ACTIVE"
test_api GET "$BASE/api/admin/sanctions/list?page=1&size=5&sanctionType=WARNING" "" "/sanctions/list?sanctionType=WARNING"
test_api GET "$BASE/api/admin/sanctions/1" "" "/sanctions/1"
test_api GET "$BASE/api/admin/sanctions/users/1" "" "/sanctions/users/1"

# --------------------------------------------------
echo ""
echo "--- [10] Place (public) ---"
test_api GET "$BASE/api/places/all-place" "" "/places/all-place"
test_api GET "$BASE/api/places/1" "" "/places/1"
test_api GET "$BASE/api/places/nearby?lat=37.5665&lng=126.978&radius=5.0" "" "/places/nearby"

# --------------------------------------------------
echo ""
echo "--- [11] Tags (public) ---"
test_api GET "$BASE/api/tags/grouped" "" "/tags/grouped"

# --------------------------------------------------
echo ""
echo "--- [12] Circles (public) ---"
test_api GET "$BASE/circles/categories" "" "/circles/categories"
test_api GET "$BASE/circles?page=1&size=5" "" "/circles (list)"
test_api GET "$BASE/circles/1" "" "/circles/1 (detail)"

# --------------------------------------------------
echo ""
echo "--- [13] Auth ---"
test_api GET "$BASE/api/auth/me" "" "/auth/me (no token = 401 expected)"
test_api POST "$BASE/api/auth/login" \
  '{"email":"test@test.com","password":"wrongpassword"}' \
  "POST /auth/login (invalid creds)"

# --------------------------------------------------
echo ""
echo "--- [14] Posts (public) ---"
test_api GET "$BASE/api/free" "" "/free (free posts list)"
test_api GET "$BASE/api/free/1" "" "/free/1 (detail)"
test_api GET "$BASE/api/notice" "" "/notice (notice list)"
test_api GET "$BASE/api/notice/1" "" "/notice/1 (detail)"
test_api POST "$BASE/api/posts/1/view" "" "POST /posts/1/view (view count)"

# --------------------------------------------------
echo ""
echo "--- [15] Replies (public read) ---"
test_api GET "$BASE/api/posts/1/replies" "" "/posts/1/replies"

# ==========================================================
#  SECTION B: ADMIN WRITE OPERATIONS
# ==========================================================
echo ""
echo "--- [16] Admin Write Operations ---"

# Report - create
test_api POST "$BASE/api/admin/reports?reporterId=1" \
  "{\"targetType\":\"POST\",\"targetId\":$((RANDOM % 9000 + 1000)),\"category\":\"SPAM\",\"description\":\"smoke test\"}" \
  "POST /reports (create)"

# Report - update status
test_api PATCH "$BASE/api/admin/reports/1/status?status=REVIEWING&adminNote=smoke-test" "" \
  "PATCH /reports/1/status"

# Sanction - create
test_api POST "$BASE/api/admin/sanctions?adminId=1" \
  '{"targetUserId":2,"targetType":"POST","targetId":1,"sanctionType":"WARNING","reason":"smoke test"}' \
  "POST /sanctions (create)"

# Admin Place - create
test_api POST "$BASE/api/admin/places/register" \
  '{"name":"Smoke Test Place","address":"Seoul","city":"Seoul","district":"Gangnam","latitude":37.5,"longitude":127.0,"capacity":10,"pricePerHour":10000,"description":"test","openTimeHour":9,"openTimeMinute":0,"closeTimeHour":22,"closeTimeMinute":0,"minReservationMinutes":60,"maxReservationMinutes":240,"tagIds":[],"placeClosedDays":[]}' \
  "POST /admin/places/register"

# Admin Notice - create
test_api POST "$BASE/api/admin/posts/notices?adminId=1" \
  '{"title":"Smoke Test Notice","content":"This is a smoke test notice"}' \
  "POST /admin/posts/notices (create)"

# Circle category - create
test_api POST "$BASE/api/admin/circles/category" \
  '{"categoryName":"SmokeCat","description":"smoke test category"}' \
  "POST /admin/circles/category"

# Log test
test_api POST "$BASE/api/admin/logs/test/log" "" \
  "POST /admin/logs/test/log"

# Circle - approve/reject (use non-existing ID to avoid side effects)
# test_api PATCH "$BASE/api/admin/circles/999/approve" "" "PATCH /circles/999/approve"
# test_api PATCH "$BASE/api/admin/circles/999/reject" "" "PATCH /circles/999/reject"
# test_api PATCH "$BASE/api/admin/circles/999/close" "" "PATCH /circles/999/close"

# ==========================================================
#  SECTION C: AUTHENTICATED USER ENDPOINTS (requires --auth)
# ==========================================================
echo ""
echo "--- [17] User Profile (auth required) ---"
test_auth_api GET "$BASE/api/users/me" "" "GET /users/me"
test_auth_api GET "$BASE/api/users/profile/check-nickname?nickname=testuser" "" "GET /users/profile/check-nickname"

echo ""
echo "--- [18] Energy Profile (auth required) ---"
test_auth_api GET "$BASE/api/users/me/energy-profile/check" "" "GET /energy-profile/check"

echo ""
echo "--- [19] My Circles (auth required) ---"
test_auth_api GET "$BASE/circles/me" "" "GET /circles/me"
test_auth_api GET "$BASE/circles/recommended" "" "GET /circles/recommended"

echo ""
echo "--- [20] Circle Boards (auth required) ---"
test_auth_api GET "$BASE/api/circle/1/boards" "" "GET /circle/1/boards"

echo ""
echo "--- [21] Circle Posts (auth required) ---"
test_auth_api GET "$BASE/api/circle/1/posts" "" "GET /circle/1/posts"

echo ""
echo "--- [22] Schedules (auth required) ---"
test_auth_api GET "$BASE/circles/1/schedules" "" "GET /circles/1/schedules"

echo ""
echo "--- [23] Chat (auth required) ---"
test_auth_api GET "$BASE/api/chat/rooms/my" "" "GET /chat/rooms/my"
test_auth_api GET "$BASE/api/chat/unread/total" "" "GET /chat/unread/total"

echo ""
echo "--- [24] Notifications (auth required) ---"
test_auth_api GET "$BASE/api/notifications" "" "GET /notifications"

echo ""
echo "--- [25] Post Reactions (auth required) ---"
test_auth_api POST "$BASE/api/posts/1/reactions/like" "" "POST /posts/1/reactions/like"

# ==========================================================
#  RESULT
# ==========================================================
echo ""
echo "============================================================"
echo "  RESULT:  PASS=$PASS  FAIL=$FAIL  TOTAL=$((PASS + FAIL))"
echo "============================================================"

if [ $FAIL -gt 0 ]; then
  echo ""
  echo "  Failed endpoints:"
  echo -e "$ERRORS"
fi

echo ""
