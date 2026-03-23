#!/bin/bash
# ============================================================
#  Admin + Place API Smoke Test
#  Usage: bash smoke-test.sh
# ============================================================

BASE="http://localhost:8080"
PASS=0
FAIL=0
ERRORS=""

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

echo ""
echo "============================================================"
echo "  Admin + Place API Smoke Test"
echo "============================================================"

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
test_api GET "$BASE/api/admin/circles/list?page=1&size=5" "" "/circles/list (default)"
test_api GET "$BASE/api/admin/circles/list?page=1&size=5&status=OPEN" "" "/circles/list?status=OPEN"
test_api GET "$BASE/api/admin/circles/popular-circles" "" "/circles/popular-circles"
test_api GET "$BASE/api/admin/circles/pending" "" "/circles/pending"

# --------------------------------------------------
echo ""
echo "--- [5] Admin Logs ---"
test_api GET "$BASE/api/admin/logs/list?page=1&size=5" "" "/logs/list"
test_api GET "$BASE/api/admin/logs/users/1/logs?page=1&size=5" "" "/logs/users/1/logs"

# --------------------------------------------------
echo ""
echo "--- [6] Admin Reports ---"
test_api GET "$BASE/api/admin/reports/list?page=1&size=5" "" "/reports/list (default)"
test_api GET "$BASE/api/admin/reports/list?page=1&size=5&status=PENDING" "" "/reports/list?status=PENDING"
test_api GET "$BASE/api/admin/reports/list?page=1&size=5&targetType=POST" "" "/reports/list?targetType=POST"
test_api GET "$BASE/api/admin/reports/1" "" "/reports/1"

# --------------------------------------------------
echo ""
echo "--- [7] Admin Sanctions ---"
test_api GET "$BASE/api/admin/sanctions/list?page=1&size=5" "" "/sanctions/list (default)"
test_api GET "$BASE/api/admin/sanctions/list?page=1&size=5&sanctionState=ACTIVE" "" "/sanctions/list?sanctionState=ACTIVE"
test_api GET "$BASE/api/admin/sanctions/list?page=1&size=5&sanctionType=WARNING" "" "/sanctions/list?sanctionType=WARNING"
test_api GET "$BASE/api/admin/sanctions/1" "" "/sanctions/1"
test_api GET "$BASE/api/admin/sanctions/users/1" "" "/sanctions/users/1"

# --------------------------------------------------
echo ""
echo "--- [8] Place ---"
test_api GET "$BASE/api/place/all-place" "" "/place/all-place"
test_api GET "$BASE/api/place/1" "" "/place/1"
test_api GET "$BASE/api/place/nearby?lat=37.5665&lng=126.978&radius=5.0" "" "/place/nearby"

# --------------------------------------------------
#  Write operations (POST/PATCH/PUT/DELETE)
#  These modify data - uncomment to test
# --------------------------------------------------
echo ""
echo "--- [9] Write Operations (POST/PATCH) ---"

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

# Place - create
test_api POST "$BASE/api/place/register" \
  '{"name":"Smoke Test Place","address":"Seoul","city":"Seoul","district":"Gangnam","latitude":37.5,"longitude":127.0,"capacity":10,"pricePerHour":10000,"description":"test","openTimeHour":9,"openTimeMinute":0,"closeTimeHour":22,"closeTimeMinute":0,"minReservationMinutes":60,"maxReservationMinutes":240,"tagIds":[],"placeClosedDays":[]}' \
  "POST /place/register"

# Circle - approve/reject (use non-existing ID to avoid side effects)
# test_api PATCH "$BASE/api/admin/circles/999/approve" "" "PATCH /circles/999/approve"

# --------------------------------------------------
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
