"""
Load testing for API endpoints using Locust
Install: pip install locust
Run: locust -f tests/load_test.py --host=http://localhost:8000
"""
from locust import HttpUser, task, between
import random


class APIUser(HttpUser):
    wait_time = between(1, 3)  # Wait 1-3 seconds between requests
    
    def on_start(self):
        """Login and get auth token"""
        # Register or login
        self.token = None
        try:
            response = self.client.post("/api/users/login/", json={
                "email": "test@example.com",
                "password": "testpassword123"
            })
            if response.status_code == 200:
                data = response.json()
                self.token = data.get("access")
        except Exception:
            pass  # Continue without auth for public endpoints
    
    @task(3)
    def health_check(self):
        """Health check endpoint - high frequency"""
        self.client.get("/health/")
    
    @task(2)
    def list_conversations(self):
        """List conversations - medium frequency"""
        headers = {}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        self.client.get("/api/chatbot/list/", headers=headers)
    
    @task(1)
    def send_message(self):
        """Send chat message - lower frequency"""
        headers = {}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        
        # Start conversation if needed
        session_id = f"test_session_{random.randint(1000, 9999)}"
        self.client.post("/api/chatbot/start/", headers=headers)
        
        # Send message
        self.client.post("/api/chatbot/send/", json={
            "session_id": session_id,
            "message": "This is a load test message"
        }, headers=headers)
    
    @task(1)
    def search_psychoeducation(self):
        """Search psychoeducation - lower frequency"""
        headers = {}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        
        search_terms = ["depression", "anxiety", "stress", "coping", "therapy"]
        query = random.choice(search_terms)
        self.client.get(f"/api/chatbot/search/?q={query}&scope=psycho", headers=headers)
    
    @task(1)
    def get_psychoeducation(self):
        """Get psychoeducation content"""
        headers = {}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        self.client.get("/api/chatbot/psychoeducation/", headers=headers)


class PublicUser(HttpUser):
    """Public (unauthenticated) user behavior"""
    wait_time = between(2, 5)
    
    @task(3)
    def health_check(self):
        self.client.get("/health/")
    
    @task(1)
    def public_pages(self):
        """Test public endpoints"""
        endpoints = [
            "/api/chatbot/psychoeducation/",
        ]
        self.client.get(random.choice(endpoints))

