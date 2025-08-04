#!/bin/bash

# ===================================================================
# Blog Application Deployment Script
# ===================================================================
#
# This script provides a unified interface for deploying the blog
# application across different environments with comprehensive
# validation and monitoring.
#
# Usage:
#   ./deploy.sh [OPTIONS]
#
# Examples:
#   ./deploy.sh --environment staging --version v1.2.0
#   ./deploy.sh --environment production --version v1.2.0 --strategy blue-green
#   ./deploy.sh --environment development --local
#
# ===================================================================

set -euo pipefail

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/deployment-$(date +%Y%m%d-%H%M%S).log"

# Default values
ENVIRONMENT=""
VERSION="latest"
STRATEGY="rolling"
DRY_RUN=false
FORCE=false
LOCAL_MODE=false
SKIP_TESTS=false
BACKUP=true
VERBOSE=false

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ===================================================================
# Helper Functions
# ===================================================================

log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    echo -e "${timestamp} [${level}] ${message}" | tee -a "${LOG_FILE}"
}

info() {
    log "INFO" "${BLUE}$*${NC}"
}

success() {
    log "SUCCESS" "${GREEN}$*${NC}"
}

warning() {
    log "WARNING" "${YELLOW}$*${NC}"
}

error() {
    log "ERROR" "${RED}$*${NC}"
}

debug() {
    if [[ "${VERBOSE}" == "true" ]]; then
        log "DEBUG" "$*"
    fi
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Create log directory
mkdir -p "$(dirname "${LOG_FILE}")"

# ===================================================================
# Validation Functions
# ===================================================================

validate_prerequisites() {
    info "Validating prerequisites..."
    
    local missing_tools=()
    
    # Check required tools
    if ! command_exists docker; then
        missing_tools+=("docker")
    fi
    
    if ! command_exists docker-compose; then
        missing_tools+=("docker-compose")
    fi
    
    if [[ "${ENVIRONMENT}" != "development" ]] && ! command_exists ansible-playbook; then
        missing_tools+=("ansible")
    fi
    
    if ! command_exists git; then
        missing_tools+=("git")
    fi
    
    if ! command_exists curl; then
        missing_tools+=("curl")
    fi
    
    if [[ ${#missing_tools[@]} -gt 0 ]]; then
        error "Missing required tools: ${missing_tools[*]}"
        error "Please install the missing tools and try again."
        exit 1
    fi
    
    # Check Docker daemon
    if ! docker info >/dev/null 2>&1; then
        error "Docker daemon is not running or not accessible"
        exit 1
    fi
    
    # Check Git repository
    if [[ ! -d "${PROJECT_ROOT}/.git" ]]; then
        error "Not in a Git repository"
        exit 1
    fi
    
    success "Prerequisites validation passed"
}

validate_environment() {
    info "Validating environment configuration..."
    
    case "${ENVIRONMENT}" in
        development|staging|production)
            debug "Environment '${ENVIRONMENT}' is valid"
            ;;
        *)
            error "Invalid environment: ${ENVIRONMENT}"
            error "Valid environments: development, staging, production"
            exit 1
            ;;
    esac
    
    # Check environment-specific requirements
    case "${ENVIRONMENT}" in
        production)
            if [[ "${STRATEGY}" != "blue-green" ]] && [[ "${FORCE}" != "true" ]]; then
                warning "Production deployments should use blue-green strategy"
                warning "Use --force to override or specify --strategy blue-green"
            fi
            ;;
        staging)
            if [[ "${VERSION}" == "latest" ]]; then
                warning "Staging deployments should use specific version tags"
            fi
            ;;
    esac
    
    success "Environment validation passed"
}

validate_version() {
    info "Validating version..."
    
    if [[ "${LOCAL_MODE}" == "true" ]]; then
        debug "Local mode - skipping version validation"
        return 0
    fi
    
    # Check if version exists in container registry
    if [[ "${VERSION}" != "latest" ]]; then
        info "Checking if version ${VERSION} exists in registry..."
        
        # This would normally check the container registry
        # For now, we'll just validate the format
        if [[ ! "${VERSION}" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]] && [[ "${VERSION}" != "latest" ]]; then
            warning "Version format should be 'vX.Y.Z' (e.g., v1.2.0)"
        fi
    fi
    
    success "Version validation passed"
}

# ===================================================================
# Deployment Functions
# ===================================================================

backup_current_deployment() {
    if [[ "${BACKUP}" != "true" ]] || [[ "${ENVIRONMENT}" == "development" ]]; then
        debug "Skipping backup"
        return 0
    fi
    
    info "Creating deployment backup..."
    
    local backup_dir="${PROJECT_ROOT}/backups"
    local backup_file="${backup_dir}/backup-${ENVIRONMENT}-$(date +%Y%m%d-%H%M%S).tar.gz"
    
    mkdir -p "${backup_dir}"
    
    case "${ENVIRONMENT}" in
        staging|production)
            # Run Ansible backup playbook
            ansible-playbook \
                -i "ansible/inventory/${ENVIRONMENT}" \
                ansible/playbooks/backup.yml \
                -e "backup_file=${backup_file}" \
                >> "${LOG_FILE}" 2>&1
            ;;
        *)
            # Local backup
            tar -czf "${backup_file}" \
                -C "${PROJECT_ROOT}" \
                --exclude='.git' \
                --exclude='node_modules' \
                --exclude='logs' \
                . >> "${LOG_FILE}" 2>&1
            ;;
    esac
    
    success "Backup created: ${backup_file}"
}

deploy_development() {
    info "Starting development deployment..."
    
    cd "${PROJECT_ROOT}"
    
    if [[ "${LOCAL_MODE}" == "true" ]]; then
        info "Starting local development servers..."
        
        # Backend
        cd blog-list
        if [[ ! -f ".env" ]]; then
            cp .env.example .env
            warning "Created .env file from template - please configure it"
        fi
        npm install >> "${LOG_FILE}" 2>&1
        npm run start:dev &
        BACKEND_PID=$!
        
        # Frontend
        cd ../bloglist-frontend
        if [[ ! -f ".env.local" ]]; then
            cp .env.frontend.example .env.local
            warning "Created .env.local file from template - please configure it"
        fi
        npm install >> "${LOG_FILE}" 2>&1
        npm run dev &
        FRONTEND_PID=$!
        
        success "Development servers started"
        info "Backend PID: ${BACKEND_PID}"
        info "Frontend PID: ${FRONTEND_PID}"
        info "Backend URL: http://localhost:8081"
        info "Frontend URL: http://localhost:5173"
        
    else
        info "Starting development Docker environment..."
        
        docker-compose -f docker/development/docker-compose.dev.yml up -d >> "${LOG_FILE}" 2>&1
        
        success "Development Docker environment started"
        info "Frontend URL: http://localhost:3001"
        info "Backend URL: http://localhost:8081"
        info "MongoDB Express: http://localhost:8083"
        info "Redis Commander: http://localhost:8082"
        info "Mailhog: http://localhost:8025"
    fi
}

deploy_staging() {
    info "Starting staging deployment..."
    
    cd "${PROJECT_ROOT}"
    
    # Run Ansible staging deployment
    ansible-playbook \
        -i ansible/inventory/staging \
        ansible/site.yml \
        -e "app_version=${VERSION}" \
        -e "app_environment=staging" \
        -e "docker_image_tag=${VERSION}" \
        >> "${LOG_FILE}" 2>&1
    
    success "Staging deployment completed"
}

deploy_production() {
    info "Starting production deployment with ${STRATEGY} strategy..."
    
    cd "${PROJECT_ROOT}"
    
    case "${STRATEGY}" in
        blue-green)
            info "Executing blue-green deployment..."
            
            # Deploy to inactive environment
            ansible-playbook \
                -i ansible/inventory/production \
                ansible/playbooks/deploy-app.yml \
                -e "app_version=${VERSION}" \
                -e "app_environment=production" \
                -e "deployment_strategy=blue-green" \
                -e "docker_image_tag=${VERSION}" \
                >> "${LOG_FILE}" 2>&1
            
            # Switch traffic
            info "Switching traffic to new deployment..."
            ansible-playbook \
                -i ansible/inventory/production \
                ansible/playbooks/traffic-switch.yml \
                >> "${LOG_FILE}" 2>&1
            ;;
            
        rolling)
            info "Executing rolling deployment..."
            
            ansible-playbook \
                -i ansible/inventory/production \
                ansible/site.yml \
                -e "app_version=${VERSION}" \
                -e "app_environment=production" \
                -e "deployment_strategy=rolling" \
                -e "docker_image_tag=${VERSION}" \
                -e "rolling_update_batch=25%" \
                >> "${LOG_FILE}" 2>&1
            ;;
            
        *)
            error "Unknown deployment strategy: ${STRATEGY}"
            exit 1
            ;;
    esac
    
    success "Production deployment completed"
}

# ===================================================================
# Health Check Functions
# ===================================================================

run_health_checks() {
    info "Running health checks..."
    
    local max_attempts=10
    local attempt=1
    local health_check_passed=false
    
    while [[ ${attempt} -le ${max_attempts} ]]; do
        info "Health check attempt ${attempt}/${max_attempts}..."
        
        case "${ENVIRONMENT}" in
            development)
                if [[ "${LOCAL_MODE}" == "true" ]]; then
                    # Check local development servers
                    if curl -s -f http://localhost:8081/api/ping >/dev/null && \
                       curl -s -f http://localhost:5173 >/dev/null; then
                        health_check_passed=true
                        break
                    fi
                else
                    # Check Docker development environment
                    if curl -s -f http://localhost:8081/api/ping >/dev/null && \
                       curl -s -f http://localhost:3001 >/dev/null; then
                        health_check_passed=true
                        break
                    fi
                fi
                ;;
                
            staging)
                # Use custom health check action
                if cd "${PROJECT_ROOT}" && \
                   .github/actions/health-check/action.yml \
                   --services frontend,backend \
                   --base-url https://staging.blog-app.example.com \
                   --timeout 30 \
                   --retry-count 3; then
                    health_check_passed=true
                    break
                fi
                ;;
                
            production)
                # Use comprehensive health check
                if ansible-playbook \
                    -i ansible/inventory/production \
                    ansible/playbooks/health-check.yml \
                    >> "${LOG_FILE}" 2>&1; then
                    health_check_passed=true
                    break
                fi
                ;;
        esac
        
        if [[ ${attempt} -lt ${max_attempts} ]]; then
            warning "Health check failed, waiting 10 seconds before retry..."
            sleep 10
        fi
        
        ((attempt++))
    done
    
    if [[ "${health_check_passed}" == "true" ]]; then
        success "Health checks passed"
    else
        error "Health checks failed after ${max_attempts} attempts"
        return 1
    fi
}

run_post_deployment_tests() {
    if [[ "${SKIP_TESTS}" == "true" ]]; then
        debug "Skipping post-deployment tests"
        return 0
    fi
    
    info "Running post-deployment tests..."
    
    case "${ENVIRONMENT}" in
        development)
            # Run basic smoke tests
            info "Running smoke tests..."
            if [[ -f "${PROJECT_ROOT}/scripts/smoke-tests.sh" ]]; then
                bash "${PROJECT_ROOT}/scripts/smoke-tests.sh" >> "${LOG_FILE}" 2>&1
            fi
            ;;
            
        staging|production)
            # Run comprehensive test suite
            info "Running integration tests..."
            ansible-playbook \
                -i "ansible/inventory/${ENVIRONMENT}" \
                ansible/playbooks/integration-tests.yml \
                >> "${LOG_FILE}" 2>&1
            ;;
    esac
    
    success "Post-deployment tests completed"
}

# ===================================================================
# Main Deployment Function
# ===================================================================

main_deployment() {
    info "Starting deployment to ${ENVIRONMENT} environment"
    info "Version: ${VERSION}"
    info "Strategy: ${STRATEGY}"
    info "Dry run: ${DRY_RUN}"
    
    if [[ "${DRY_RUN}" == "true" ]]; then
        info "DRY RUN MODE - No actual changes will be made"
    fi
    
    # Step 1: Validate everything
    validate_prerequisites
    validate_environment
    validate_version
    
    # Step 2: Create backup
    if [[ "${DRY_RUN}" != "true" ]]; then
        backup_current_deployment
    fi
    
    # Step 3: Deploy based on environment
    if [[ "${DRY_RUN}" != "true" ]]; then
        case "${ENVIRONMENT}" in
            development)
                deploy_development
                ;;
            staging)
                deploy_staging
                ;;
            production)
                deploy_production
                ;;
        esac
    else
        info "DRY RUN: Would deploy to ${ENVIRONMENT} with version ${VERSION}"
    fi
    
    # Step 4: Run health checks
    if [[ "${DRY_RUN}" != "true" ]]; then
        sleep 10  # Give services time to start
        run_health_checks
        
        # Step 5: Run post-deployment tests
        run_post_deployment_tests
    fi
    
    success "Deployment completed successfully!"
    info "Deployment log: ${LOG_FILE}"
}

# ===================================================================
# Usage and Argument Parsing
# ===================================================================

show_usage() {
    cat << EOF
Blog Application Deployment Script

Usage: $0 [OPTIONS]

OPTIONS:
  -e, --environment ENV     Target environment (development, staging, production)
  -v, --version VERSION     Application version to deploy (default: latest)
  -s, --strategy STRATEGY   Deployment strategy (rolling, blue-green) (default: rolling)
  -d, --dry-run            Perform a dry run without making changes
  -f, --force              Force deployment without confirmations
  -l, --local              Use local development mode (development only)
  -t, --skip-tests         Skip post-deployment tests
  -n, --no-backup          Skip creating backup before deployment
      --verbose            Enable verbose logging
  -h, --help               Show this help message

EXAMPLES:
  $0 --environment development --local
  $0 --environment staging --version v1.2.0
  $0 --environment production --version v1.2.0 --strategy blue-green
  $0 --environment production --version v1.2.0 --dry-run

NOTES:
  - Production deployments require explicit version specification
  - Blue-green strategy is recommended for production
  - All deployments are logged to logs/deployment-YYYYMMDD-HHMMSS.log

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -v|--version)
            VERSION="$2"
            shift 2
            ;;
        -s|--strategy)
            STRATEGY="$2"
            shift 2
            ;;
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -f|--force)
            FORCE=true
            shift
            ;;
        -l|--local)
            LOCAL_MODE=true
            shift
            ;;
        -t|--skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        -n|--no-backup)
            BACKUP=false
            shift
            ;;
        --verbose)
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

# Validate required arguments
if [[ -z "${ENVIRONMENT}" ]]; then
    error "Environment is required"
    show_usage
    exit 1
fi

# ===================================================================
# Main Execution
# ===================================================================

info "Blog Application Deployment Script"
info "======================================="

# Trap to handle interruption
trap 'error "Deployment interrupted"; exit 130' INT TERM

# Run main deployment
main_deployment

success "Deployment script completed successfully!"