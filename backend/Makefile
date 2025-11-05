.PHONY: test test-coverage test-fast clean install migrate

# Install dependencies
install:
	pip install -r requirements.txt

# Run migrations
migrate:
	python manage.py migrate

# Run all tests
test:
	python manage.py test

# Run tests with coverage
test-coverage:
	coverage run --source='.' manage.py test
	coverage report
	coverage html
	@echo "Coverage report generated at htmlcov/index.html"

# Run specific test suite
test-auth:
	python manage.py test users.tests_auth --verbosity=2

test-chatbot:
	python manage.py test chatbot.tests_api --verbosity=2

test-graphql:
	python manage.py test graphql_app.tests --verbosity=2

# Fast test run (no migrations)
test-fast:
	python manage.py test --no-migrations

# Clean generated files
clean:
	find . -type d -name "__pycache__" -exec rm -r {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	find . -type d -name "*.egg-info" -exec rm -r {} + 2>/dev/null || true
	rm -rf htmlcov/
	rm -f .coverage
	rm -f coverage.xml
	rm -rf .pytest_cache/
	rm -rf .tox/

# Full test suite with coverage and report
test-all: clean install migrate test-coverage

# Run linting (if you have flake8, pylint, etc.)
lint:
	@echo "Running linting checks..."
	@echo "Add your linting commands here"

# Check code style
check:
	@echo "Running code style checks..."
	@echo "Add your style checking commands here"

