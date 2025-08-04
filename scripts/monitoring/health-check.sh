#!/bin/bash

# ===================================================================
# Blog Application Health Check Script
# ===================================================================
#
# This script performs comprehensive health checks for the blog
# application across all components and environments.
#
# Usage:
#   ./health-check.sh [OPTIONS]
#
# Examples:
#   ./health-check.sh --environment production
#   ./health-check.sh --environment staging --comprehensive
#   ./health-check.sh --services frontend,backend --timeout 30
#
# ===================================================================

set -euo pipefail

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# Default values
ENVIRONMENT="development"
SERVICES="frontend,backend,database,cache"
TIMEOUT=30
RETRIES=3
COMPREHENSIVE=false
VERBOSE=false
CONTINUOUS=false
INTERVAL=60
OUTPUT_FORMAT="text"
ALERT_ON_FAILURE=false

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Health check results
declare -A HEALTH_STATUS
declare -A RESPONSE_TIMES
declare -A ERROR_MESSAGES

# ===================================================================
# Utility Functions
# ===================================================================

log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        "INFO")
            echo -e "${timestamp} ${BLUE}[INFO]${NC} $message"
            ;;
        "SUCCESS")
            echo -e "${timestamp} ${GREEN}[SUCCESS]${NC} $message"
            ;;
        "WARNING")
            echo -e "${timestamp} ${YELLOW}[WARNING]${NC} $message"
            ;;
        "ERROR")
            echo -e "${timestamp} ${RED}[ERROR]${NC} $message"
            ;;
        "DEBUG")
            if [[ "$VERBOSE" == "true" ]]; then
                echo -e "${timestamp} ${PURPLE}[DEBUG]${NC} $message"
            fi
            ;;
    esac
}

info() { log "INFO" "$*"; }
success() { log "SUCCESS" "$*"; }
warning() { log "WARNING" "$*"; }
error() { log "ERROR" "$*"; }
debug() { log "DEBUG" "$*"; }

# Get environment URLs
get_environment_urls() {
    case "$ENVIRONMENT" in
        development)
            FRONTEND_URL="http://localhost:3001"
            BACKEND_URL="http://localhost:8081"
            DATABASE_URL="mongodb://localhost:27017"
            CACHE_URL="redis://localhost:6379"
            ;;
        staging)
            FRONTEND_URL="https://staging.blog-app.example.com"
            BACKEND_URL="https://api.staging.blog-app.example.com"
            DATABASE_URL="mongodb://staging-db.example.com:27017"
            CACHE_URL="redis://staging-cache.example.com:6379"
            ;;
        production)
            FRONTEND_URL="https://blog-app.example.com"
            BACKEND_URL="https://api.blog-app.example.com"
            DATABASE_URL="mongodb://prod-db.example.com:27017"
            CACHE_URL="redis://prod-cache.example.com:6379"
            ;;
        *)
            error "Unknown environment: $ENVIRONMENT"
            exit 1
            ;;
    esac
}

# ===================================================================
# Service Health Check Functions
# ===================================================================

check_frontend_health() {
    local service="frontend"
    local start_time=$(date +%s%3N)
    
    debug "Checking frontend health at $FRONTEND_URL"
    
    local http_code
    local response_time
    
    if http_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time "$TIMEOUT" "$FRONTEND_URL" 2>/dev/null); then
        local end_time=$(date +%s%3N)
        response_time=$((end_time - start_time))
        
        if [[ "$http_code" == "200" ]]; then
            HEALTH_STATUS[$service]="healthy"
            RESPONSE_TIMES[$service]="${response_time}ms"
            success "Frontend health check passed (${response_time}ms)"
        else
            HEALTH_STATUS[$service]="unhealthy"
            ERROR_MESSAGES[$service]="HTTP $http_code"
            warning "Frontend health check failed: HTTP $http_code"
        fi
    else
        HEALTH_STATUS[$service]="unhealthy"
        ERROR_MESSAGES[$service]="Connection failed"
        error "Frontend health check failed: Connection failed"
    fi
}

check_backend_health() {
    local service="backend"
    local start_time=$(date +%s%3N)
    local health_endpoint="${BACKEND_URL}/api/ping"
    
    debug "Checking backend health at $health_endpoint"
    
    local http_code
    local response_time
    
    if http_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time "$TIMEOUT" "$health_endpoint" 2>/dev/null); then
        local end_time=$(date +%s%3N)
        response_time=$((end_time - start_time))
        
        if [[ "$http_code" == "200" ]]; then
            HEALTH_STATUS[$service]="healthy"
            RESPONSE_TIMES[$service]="${response_time}ms"
            success "Backend health check passed (${response_time}ms)"
            
            # Additional API endpoint checks if comprehensive mode
            if [[ "$COMPREHENSIVE" == "true" ]]; then
                check_backend_endpoints
            fi
        else
            HEALTH_STATUS[$service]="unhealthy"
            ERROR_MESSAGES[$service]="HTTP $http_code"
            warning "Backend health check failed: HTTP $http_code"
        fi
    else
        HEALTH_STATUS[$service]="unhealthy"
        ERROR_MESSAGES[$service]="Connection failed"
        error "Backend health check failed: Connection failed"
    fi
}

check_backend_endpoints() {
    debug "Running comprehensive backend endpoint checks"
    
    local endpoints=(
        "/api/blogs"
        "/api/users"
    )
    
    for endpoint in "${endpoints[@]}"; do
        local url="${BACKEND_URL}${endpoint}"
        local http_code
        
        if http_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time "$TIMEOUT" "$url" 2>/dev/null); then
            if [[ "$http_code" == "200" ]]; then
                debug "Endpoint $endpoint: OK"
            else
                warning "Endpoint $endpoint: HTTP $http_code"
            fi
        else
            warning "Endpoint $endpoint: Connection failed"
        fi
    done
}

check_database_health() {
    local service="database"
    debug "Checking database health"
    
    # For MongoDB, we'll use a simple connection test
    case "$ENVIRONMENT" in
        development)
            # Check if MongoDB container is running
            if docker ps | grep -q mongo; then
                if docker exec $(docker ps | grep mongo | awk '{print $1}' | head -1) mongosh --eval "db.runCommand('ping')" --quiet >/dev/null 2>&1; then
                    HEALTH_STATUS[$service]="healthy"
                    success "Database health check passed"
                else
                    HEALTH_STATUS[$service]="unhealthy"
                    ERROR_MESSAGES[$service]="MongoDB ping failed"
                    error "Database health check failed: MongoDB ping failed"
                fi
            else
                HEALTH_STATUS[$service]="unhealthy"
                ERROR_MESSAGES[$service]="MongoDB container not running"
                error "Database health check failed: Container not running"
            fi
            ;;
        staging|production)
            # For remote databases, we'd use network connectivity tests
            # This is a simplified check - in practice, you'd use proper MongoDB client
            local db_host=$(echo "$DATABASE_URL" | sed 's|mongodb://||' | cut -d':' -f1)
            local db_port=$(echo "$DATABASE_URL" | sed 's|mongodb://||' | cut -d':' -f2 | cut -d'/' -f1)
            
            if timeout "$TIMEOUT" bash -c "</dev/tcp/$db_host/$db_port"; then
                HEALTH_STATUS[$service]="healthy"
                success "Database health check passed"
            else
                HEALTH_STATUS[$service]="unhealthy"
                ERROR_MESSAGES[$service]="Connection failed"
                error "Database health check failed: Connection failed"
            fi
            ;;
    esac
}

check_cache_health() {
    local service="cache"
    debug "Checking cache health"
    
    case "$ENVIRONMENT" in
        development)
            # Check if Redis container is running
            if docker ps | grep -q redis; then
                if docker exec $(docker ps | grep redis | awk '{print $1}' | head -1) redis-cli ping >/dev/null 2>&1; then
                    HEALTH_STATUS[$service]="healthy"
                    success "Cache health check passed"
                else
                    HEALTH_STATUS[$service]="unhealthy"
                    ERROR_MESSAGES[$service]="Redis ping failed"
                    error "Cache health check failed: Redis ping failed"
                fi
            else
                HEALTH_STATUS[$service]="unhealthy"
                ERROR_MESSAGES[$service]="Redis container not running"
                error "Cache health check failed: Container not running"
            fi
            ;;
        staging|production)
            local cache_host=$(echo "$CACHE_URL" | sed 's|redis://||' | cut -d':' -f1)
            local cache_port=$(echo "$CACHE_URL" | sed 's|redis://||' | cut -d':' -f2)
            
            if timeout "$TIMEOUT" bash -c "</dev/tcp/$cache_host/$cache_port"; then
                HEALTH_STATUS[$service]="healthy"
                success "Cache health check passed"
            else
                HEALTH_STATUS[$service]="unhealthy"
                ERROR_MESSAGES[$service]="Connection failed"
                error "Cache health check failed: Connection failed"
            fi
            ;;
    esac
}

# ===================================================================
# Main Health Check Function
# ===================================================================

run_health_checks() {
    info "Running health checks for environment: $ENVIRONMENT"
    info "Services to check: $SERVICES"
    info "Timeout: ${TIMEOUT}s, Retries: $RETRIES"
    
    get_environment_urls
    
    # Convert services string to array
    IFS=',' read -ra SERVICE_ARRAY <<< "$SERVICES"
    
    local overall_healthy=true
    
    for service in "${SERVICE_ARRAY[@]}"; do
        service=$(echo "$service" | xargs)  # Trim whitespace
        
        info "Checking $service health..."
        
        local attempt=1
        local service_healthy=false
        
        while [[ $attempt -le $RETRIES ]]; do
            debug "Attempt $attempt/$RETRIES for $service"
            
            case "$service" in
                frontend)
                    check_frontend_health
                    ;;
                backend)
                    check_backend_health
                    ;;
                database)
                    check_database_health
                    ;;
                cache)
                    check_cache_health
                    ;;
                *)
                    warning "Unknown service: $service"
                    continue
                    ;;
            esac
            
            if [[ "${HEALTH_STATUS[$service]}" == "healthy" ]]; then
                service_healthy=true
                break
            elif [[ $attempt -lt $RETRIES ]]; then
                warning "Retrying $service health check in 5 seconds..."
                sleep 5
            fi
            
            ((attempt++))
        done
        
        if [[ "$service_healthy" != "true" ]]; then
            overall_healthy=false
        fi
    done
    
    return $([ "$overall_healthy" == "true" ] && echo 0 || echo 1)
}

# ===================================================================
# Output Functions
# ===================================================================

display_results() {
    echo
    info "Health Check Results"
    info "===================="
    
    case "$OUTPUT_FORMAT" in
        text)
            display_text_results
            ;;
        json)
            display_json_results
            ;;
        csv)
            display_csv_results
            ;;
        *)
            display_text_results
            ;;
    esac
}

display_text_results() {
    local overall_status="HEALTHY"
    
    printf "%-12s %-10s %-12s %-30s\n" "SERVICE" "STATUS" "RESPONSE" "ERROR"
    printf "%-12s %-10s %-12s %-30s\n" "-------" "------" "--------" "-----"
    
    for service in "${!HEALTH_STATUS[@]}"; do
        local status="${HEALTH_STATUS[$service]}"
        local response_time="${RESPONSE_TIMES[$service]:-N/A}"
        local error_msg="${ERROR_MESSAGES[$service]:-}"
        
        if [[ "$status" != "healthy" ]]; then
            overall_status="UNHEALTHY"
        fi
        
        # Color coding for status
        local status_colored
        case "$status" in
            healthy)
                status_colored="${GREEN}HEALTHY${NC}"
                ;;
            unhealthy)
                status_colored="${RED}UNHEALTHY${NC}"
                ;;
            *)
                status_colored="${YELLOW}UNKNOWN${NC}"
                ;;
        esac
        
        printf "%-12s %-18s %-12s %-30s\n" "$service" "$status_colored" "$response_time" "$error_msg"
    done
    
    echo
    if [[ "$overall_status" == "HEALTHY" ]]; then
        success "Overall Status: $overall_status"
    else
        error "Overall Status: $overall_status"
    fi
}

display_json_results() {
    local json_output="{"
    json_output+="\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\","
    json_output+="\"environment\":\"$ENVIRONMENT\","
    json_output+="\"overall_status\":\"$([ "$(get_overall_status)" == "0" ] && echo "healthy" || echo "unhealthy")\","
    json_output+="\"services\":{"
    
    local first=true
    for service in "${!HEALTH_STATUS[@]}"; do
        if [[ "$first" != "true" ]]; then
            json_output+=","
        fi
        json_output+="\"$service\":{"
        json_output+="\"status\":\"${HEALTH_STATUS[$service]}\","
        json_output+="\"response_time\":\"${RESPONSE_TIMES[$service]:-}\","
        json_output+="\"error\":\"${ERROR_MESSAGES[$service]:-}\""
        json_output+="}"
        first=false
    done
    
    json_output+="}}"
    echo "$json_output" | jq '.' 2>/dev/null || echo "$json_output"
}

display_csv_results() {
    echo "service,status,response_time,error"
    for service in "${!HEALTH_STATUS[@]}"; do
        printf "%s,%s,%s,%s\n" \
            "$service" \
            "${HEALTH_STATUS[$service]}" \
            "${RESPONSE_TIMES[$service]:-}" \
            "${ERROR_MESSAGES[$service]:-}"
    done
}

get_overall_status() {
    for service in "${!HEALTH_STATUS[@]}"; do
        if [[ "${HEALTH_STATUS[$service]}" != "healthy" ]]; then
            echo 1
            return
        fi
    done
    echo 0
}

# ===================================================================
# Alert Functions
# ===================================================================

send_alert() {
    if [[ "$ALERT_ON_FAILURE" != "true" ]]; then
        return
    fi
    
    local overall_status=$(get_overall_status)
    if [[ "$overall_status" != "0" ]]; then
        warning "Sending failure alert..."
        
        # Here you would integrate with your alerting system
        # Examples: Slack webhook, email, PagerDuty, etc.
        local alert_message="Health check failed for $ENVIRONMENT environment"
        
        # Example Slack webhook (if SLACK_WEBHOOK_URL is set)
        if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
            curl -X POST -H 'Content-type: application/json' \
                --data "{\"text\":\"$alert_message\"}" \
                "$SLACK_WEBHOOK_URL" >/dev/null 2>&1
        fi
        
        info "Alert sent"
    fi
}

# ===================================================================
# Main Execution Functions
# ===================================================================

run_single_check() {
    run_health_checks
    local exit_code=$?
    
    display_results
    send_alert
    
    return $exit_code
}

run_continuous_checks() {
    info "Starting continuous health monitoring (interval: ${INTERVAL}s)"
    info "Press Ctrl+C to stop"
    
    while true; do
        echo
        info "Running health check at $(date)"
        
        run_health_checks
        display_results
        send_alert
        
        debug "Waiting ${INTERVAL} seconds before next check..."
        sleep "$INTERVAL"
    done
}

# ===================================================================
# Usage and Argument Parsing
# ===================================================================

show_usage() {
    cat << EOF
Blog Application Health Check Script

Usage: $0 [OPTIONS]

OPTIONS:
  -e, --environment ENV     Target environment (development, staging, production)
  -s, --services SERVICES   Comma-separated list of services to check
                           (frontend,backend,database,cache)
  -t, --timeout SECONDS     Timeout for each health check (default: 30)
  -r, --retries COUNT       Number of retries for failed checks (default: 3)
  -c, --comprehensive       Run comprehensive health checks
  -C, --continuous         Run continuous health monitoring
  -i, --interval SECONDS    Interval for continuous monitoring (default: 60)
  -f, --format FORMAT       Output format (text, json, csv) (default: text)
  -a, --alert-on-failure    Send alerts on health check failures
  -v, --verbose            Enable verbose logging
  -h, --help               Show this help message

EXAMPLES:
  $0 --environment production
  $0 --environment staging --comprehensive
  $0 --services frontend,backend --timeout 30
  $0 --continuous --interval 30 --format json
  $0 --environment production --alert-on-failure

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -s|--services)
            SERVICES="$2"
            shift 2
            ;;
        -t|--timeout)
            TIMEOUT="$2"
            shift 2
            ;;
        -r|--retries)
            RETRIES="$2"
            shift 2
            ;;
        -c|--comprehensive)
            COMPREHENSIVE=true
            shift
            ;;
        -C|--continuous)
            CONTINUOUS=true
            shift
            ;;
        -i|--interval)
            INTERVAL="$2"
            shift 2
            ;;
        -f|--format)
            OUTPUT_FORMAT="$2"
            shift 2
            ;;
        -a|--alert-on-failure)
            ALERT_ON_FAILURE=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# ===================================================================
# Main Execution
# ===================================================================

info "Blog Application Health Check"
info "=============================="

# Trap to handle interruption
trap 'info "Health check interrupted"; exit 130' INT TERM

# Run health checks
if [[ "$CONTINUOUS" == "true" ]]; then
    run_continuous_checks
else
    run_single_check
    exit $?
fi