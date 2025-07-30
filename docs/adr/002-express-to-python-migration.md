# ADR-002: Express to Python FastAPI Migration

<!-- Architecture Decision Record for backend technology migration -->

## Status

**COMPLETED** - January 30, 2025

## Context

Express.js was chosen as a temporary solution for rapid prototyping and initial development. However, for production deployment and optimal integration with LuminariMUD's existing MySQL spatial database, Python FastAPI was identified as the superior choice.

## Decision

**DECISION**: Migrate from Express.js/TypeScript to Python FastAPI for the production backend.

**Rationale**:
- **Direct MySQL Integration**: Native support for LuminariMUD's existing spatial database
- **Performance**: FastAPI's async capabilities and Python's spatial libraries
- **Game Integration**: Seamless integration with existing MUD infrastructure
- **Spatial Operations**: Better support for geographic and spatial data operations
- **Deployment**: Easier deployment on CentOS servers alongside existing game infrastructure

## Consequences

**Positive**:
- ✅ **Enhanced Performance**: FastAPI's async capabilities
- ✅ **Direct Database Integration**: No abstraction layer needed for MySQL
- ✅ **Simplified Deployment**: Python backend deploys easily on CentOS
- ✅ **Better Spatial Support**: Native MySQL spatial data handling
- ✅ **Automatic API Documentation**: FastAPI generates OpenAPI docs
- ✅ **Type Safety**: Pydantic schemas provide request/response validation

**Negative**:
- ✅ **Migration Completed**: Initial complexity overcome
- ✅ **Dual Maintenance**: No longer needed - Express code removed
- ✅ **Learning Curve**: Team adapted to Python/FastAPI stack

## Implementation Details

**Migration Completed**: January 30, 2025

**Key Changes**:
- Replaced Express.js with FastAPI application (`main.py`)
- Converted TypeScript models to SQLAlchemy models
- Implemented Pydantic schemas for validation
- Updated API endpoints to FastAPI routers
- Configured direct MySQL database connection
- Updated all documentation and development workflows

**Files Removed**:
- All TypeScript backend files (`*.ts`)
- Node.js backend dependencies
- Express middleware and configuration

**Files Added**:
- Python FastAPI application structure
- SQLAlchemy models for spatial data
- Pydantic schemas for request/response validation
- FastAPI routers for API endpoints
- MySQL database configuration

**Result**: Production-ready Python backend with direct LuminariMUD integration.