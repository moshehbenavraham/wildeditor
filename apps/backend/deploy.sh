#!/bin/bash

# Local deployment script for Wildeditor Backend
# This script helps you test the deployment process locally

set -e

echo "🏗️  Wildeditor Backend Local Deployment Script"
echo "=============================================="

# Configuration
DOCKER_IMAGE="wildeditor-backend"
CONTAINER_NAME="wildeditor-backend-local"
PORT=${PORT:-8000}

# Functions
cleanup() {
    echo "🧹 Cleaning up..."
    docker stop $CONTAINER_NAME 2>/dev/null || true
    docker rm $CONTAINER_NAME 2>/dev/null || true
}

build_image() {
    echo "🏗️  Building Docker image..."
    cd "$(dirname "$0")"
    docker build -t $DOCKER_IMAGE -f Dockerfile ../..
}

run_container() {
    echo "🚀 Starting container..."
    docker run -d \
        --name $CONTAINER_NAME \
        -p $PORT:8000 \
        --env-file .env \
        $DOCKER_IMAGE
}

wait_for_health() {
    echo "🏥 Waiting for health check..."
    for i in {1..30}; do
        if curl -f http://localhost:$PORT/api/health >/dev/null 2>&1; then
            echo "✅ Container is healthy!"
            return 0
        fi
        echo "Waiting... ($i/30)"
        sleep 2
    done
    echo "❌ Container failed to become healthy"
    docker logs $CONTAINER_NAME
    return 1
}

show_status() {
    echo ""
    echo "📊 Deployment Status:"
    echo "====================="
    echo "Container: $(docker ps --filter name=$CONTAINER_NAME --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}')"
    echo ""
    echo "🌐 Endpoints:"
    echo "  API Health: http://localhost:$PORT/api/health"
    echo "  API Docs:   http://localhost:$PORT/docs"
    echo "  ReDoc:      http://localhost:$PORT/redoc"
    echo ""
    echo "📝 Logs: docker logs $CONTAINER_NAME"
    echo "🛑 Stop:  docker stop $CONTAINER_NAME"
    echo ""
}

# Main execution
case "${1:-deploy}" in
    "build")
        build_image
        ;;
    "deploy")
        cleanup
        build_image
        run_container
        wait_for_health && show_status
        ;;
    "restart")
        cleanup
        run_container
        wait_for_health && show_status
        ;;
    "stop")
        cleanup
        echo "✅ Container stopped"
        ;;
    "logs")
        docker logs -f $CONTAINER_NAME
        ;;
    "shell")
        docker exec -it $CONTAINER_NAME /bin/bash
        ;;
    *)
        echo "Usage: $0 {build|deploy|restart|stop|logs|shell}"
        echo ""
        echo "Commands:"
        echo "  build   - Build Docker image only"
        echo "  deploy  - Full deployment (build + run + health check)"
        echo "  restart - Restart existing container"
        echo "  stop    - Stop and remove container"
        echo "  logs    - Show container logs"
        echo "  shell   - Open shell in container"
        exit 1
        ;;
esac
