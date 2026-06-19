#!/bin/bash

################################################################################
# Load Testing Script - Ascend
# Tests application under simulated load
################################################################################

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

API_URL=${1:-"http://localhost:3001"}
CONCURRENT_USERS=${2:-10}
DURATION=${3:-30}
RESULTS_DIR="load-test-results"

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Load Testing - Ascend${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "API URL: $API_URL"
echo -e "Concurrent Users: $CONCURRENT_USERS"
echo -e "Duration: ${DURATION}s"
echo ""

# Create results directory
mkdir -p "$RESULTS_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RESULT_FILE="$RESULTS_DIR/load_test_${TIMESTAMP}.txt"

# Check if server is reachable
echo -e "${YELLOW}Checking server health...${NC}"
if ! curl -s "$API_URL/health" > /dev/null; then
    echo -e "${RED}✗ Server not reachable at $API_URL${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Server is reachable${NC}"
echo ""

# Function to test endpoint
test_endpoint() {
    local endpoint=$1
    local method=${2:-GET}
    local data=${3:-""}
    
    if [ "$method" = "POST" ] && [ -n "$data" ]; then
        curl -s -o /dev/null -w "%{http_code},%{time_total}" \
            -X POST "$API_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data"
    else
        curl -s -o /dev/null -w "%{http_code},%{time_total}" "$API_URL$endpoint"
    fi
}

# Test scenarios
echo -e "${YELLOW}Running load tests...${NC}"
echo "" | tee "$RESULT_FILE"

# Test 1: Health Endpoint
echo -e "${YELLOW}Test 1: Health Endpoint (Light Load)${NC}" | tee -a "$RESULT_FILE"
echo "Testing /health endpoint..." | tee -a "$RESULT_FILE"
START_TIME=$(date +%s)
SUCCESS=0
FAILED=0
TOTAL_TIME=0

for i in $(seq 1 100); do
    RESULT=$(test_endpoint "/health")
    HTTP_CODE=$(echo $RESULT | cut -d',' -f1)
    TIME=$(echo $RESULT | cut -d',' -f2)
    
    if [ "$HTTP_CODE" = "200" ]; then
        ((SUCCESS++))
        TOTAL_TIME=$(echo "$TOTAL_TIME + $TIME" | bc)
    else
        ((FAILED++))
    fi
    
    if [ $((i % 20)) -eq 0 ]; then
        echo -n "." | tee -a "$RESULT_FILE"
    fi
done

END_TIME=$(date +%s)
ELAPSED=$((END_TIME - START_TIME))
AVG_TIME=$(echo "scale=3; $TOTAL_TIME / $SUCCESS" | bc)

echo "" | tee -a "$RESULT_FILE"
echo "Results:" | tee -a "$RESULT_FILE"
echo "  Total Requests: 100" | tee -a "$RESULT_FILE"
echo "  Successful: $SUCCESS" | tee -a "$RESULT_FILE"
echo "  Failed: $FAILED" | tee -a "$RESULT_FILE"
echo "  Success Rate: $((SUCCESS * 100 / 100))%" | tee -a "$RESULT_FILE"
echo "  Avg Response Time: ${AVG_TIME}s" | tee -a "$RESULT_FILE"
echo "  Total Time: ${ELAPSED}s" | tee -a "$RESULT_FILE"
echo "  Throughput: $(echo "100 / $ELAPSED" | bc) req/s" | tee -a "$RESULT_FILE"
echo "" | tee -a "$RESULT_FILE"

# Test 2: Concurrent Users Simulation
echo -e "${YELLOW}Test 2: Concurrent Users (Moderate Load)${NC}" | tee -a "$RESULT_FILE"
echo "Simulating $CONCURRENT_USERS concurrent users for ${DURATION}s..." | tee -a "$RESULT_FILE"

# Create temporary script for parallel execution
cat > /tmp/load_test_worker.sh << 'EOF'
#!/bin/bash
API_URL=$1
DURATION=$2
END_TIME=$(($(date +%s) + DURATION))
SUCCESS=0
FAILED=0

while [ $(date +%s) -lt $END_TIME ]; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/health")
    if [ "$HTTP_CODE" = "200" ]; then
        ((SUCCESS++))
    else
        ((FAILED++))
    fi
    sleep 0.1
done

echo "$SUCCESS,$FAILED"
EOF
chmod +x /tmp/load_test_worker.sh

# Run workers in parallel
PIDS=()
for i in $(seq 1 $CONCURRENT_USERS); do
    /tmp/load_test_worker.sh "$API_URL" "$DURATION" > /tmp/worker_${i}.txt &
    PIDS+=($!)
done

# Wait for all workers
echo -n "Testing" | tee -a "$RESULT_FILE"
for pid in "${PIDS[@]}"; do
    wait $pid
    echo -n "." | tee -a "$RESULT_FILE"
done
echo "" | tee -a "$RESULT_FILE"

# Aggregate results
TOTAL_SUCCESS=0
TOTAL_FAILED=0
for i in $(seq 1 $CONCURRENT_USERS); do
    RESULT=$(cat /tmp/worker_${i}.txt)
    SUCCESS=$(echo $RESULT | cut -d',' -f1)
    FAILED=$(echo $RESULT | cut -d',' -f2)
    TOTAL_SUCCESS=$((TOTAL_SUCCESS + SUCCESS))
    TOTAL_FAILED=$((TOTAL_FAILED + FAILED))
    rm /tmp/worker_${i}.txt
done

TOTAL_REQUESTS=$((TOTAL_SUCCESS + TOTAL_FAILED))
echo "Results:" | tee -a "$RESULT_FILE"
echo "  Concurrent Users: $CONCURRENT_USERS" | tee -a "$RESULT_FILE"
echo "  Duration: ${DURATION}s" | tee -a "$RESULT_FILE"
echo "  Total Requests: $TOTAL_REQUESTS" | tee -a "$RESULT_FILE"
echo "  Successful: $TOTAL_SUCCESS" | tee -a "$RESULT_FILE"
echo "  Failed: $TOTAL_FAILED" | tee -a "$RESULT_FILE"
echo "  Success Rate: $((TOTAL_SUCCESS * 100 / TOTAL_REQUESTS))%" | tee -a "$RESULT_FILE"
echo "  Throughput: $(echo "$TOTAL_REQUESTS / $DURATION" | bc) req/s" | tee -a "$RESULT_FILE"
echo "" | tee -a "$RESULT_FILE"

# Test 3: Stress Test (Login endpoint)
echo -e "${YELLOW}Test 3: Login Endpoint Stress Test${NC}" | tee -a "$RESULT_FILE"
echo "Testing authentication under load..." | tee -a "$RESULT_FILE"

SUCCESS=0
FAILED=0
TOTAL_TIME=0
LOGIN_DATA='{"email":"afro@yopmail.com","password":"123456"}'

for i in $(seq 1 50); do
    RESULT=$(test_endpoint "/api/v1/user/login" "POST" "$LOGIN_DATA")
    HTTP_CODE=$(echo $RESULT | cut -d',' -f1)
    TIME=$(echo $RESULT | cut -d',' -f2)
    
    if [ "$HTTP_CODE" = "200" ]; then
        ((SUCCESS++))
        TOTAL_TIME=$(echo "$TOTAL_TIME + $TIME" | bc)
    else
        ((FAILED++))
    fi
    
    if [ $((i % 10)) -eq 0 ]; then
        echo -n "." | tee -a "$RESULT_FILE"
    fi
done

echo "" | tee -a "$RESULT_FILE"
AVG_TIME=$(echo "scale=3; $TOTAL_TIME / $SUCCESS" | bc)
echo "Results:" | tee -a "$RESULT_FILE"
echo "  Total Requests: 50" | tee -a "$RESULT_FILE"
echo "  Successful: $SUCCESS" | tee -a "$RESULT_FILE"
echo "  Failed: $FAILED" | tee -a "$RESULT_FILE"
echo "  Avg Response Time: ${AVG_TIME}s" | tee -a "$RESULT_FILE"
echo "" | tee -a "$RESULT_FILE"

# Check server health after tests
echo -e "${YELLOW}Post-test health check...${NC}" | tee -a "$RESULT_FILE"
HEALTH_RESPONSE=$(curl -s "$API_URL/health")
if echo "$HEALTH_RESPONSE" | grep -q '"status":"ok"'; then
    echo -e "${GREEN}✓ Server is healthy after load test${NC}" | tee -a "$RESULT_FILE"
else
    echo -e "${RED}⚠ Server health degraded${NC}" | tee -a "$RESULT_FILE"
fi

# Summary
echo "" | tee -a "$RESULT_FILE"
echo -e "${GREEN}================================${NC}" | tee -a "$RESULT_FILE"
echo -e "${GREEN}Load Test Complete${NC}" | tee -a "$RESULT_FILE"
echo -e "${GREEN}================================${NC}" | tee -a "$RESULT_FILE"
echo "Results saved to: $RESULT_FILE" | tee -a "$RESULT_FILE"
echo "" | tee -a "$RESULT_FILE"

# Recommendations
echo "Recommendations:" | tee -a "$RESULT_FILE"
if [ $TOTAL_FAILED -gt 0 ]; then
    echo "  ⚠ Some requests failed - investigate error logs" | tee -a "$RESULT_FILE"
fi

if [ $(echo "$AVG_TIME > 1.0" | bc) -eq 1 ]; then
    echo "  ⚠ Avg response time >1s - consider optimization" | tee -a "$RESULT_FILE"
fi

echo "  ℹ Monitor server resources during production load" | tee -a "$RESULT_FILE"
echo "  ℹ Consider horizontal scaling at 80% capacity" | tee -a "$RESULT_FILE"

# Cleanup
rm /tmp/load_test_worker.sh

echo ""
echo -e "${GREEN}Load testing complete!${NC}"
