"""
Lightweight Chroma Cloud HTTP client.
Uses only `requests` — no chromadb package needed.
Chroma Cloud API uses collection UUIDs for most operations,
so we maintain a name→id cache.
"""
import requests
import structlog
from typing import Any, Dict, List, Optional

logger = structlog.get_logger()


class ChromaHTTPClient:
    """Minimal HTTP client for Chroma Cloud API."""

    def __init__(self, tenant: str, database: str, api_key: str, host: str = "api.trychroma.com"):
        self.tenant = tenant
        self.database = database
        self.base_url = f"https://{host}/api/v2"
        self.headers = {
            "Content-Type": "application/json",
            "x-chroma-token": api_key,
        }
        self._session = requests.Session()
        self._session.headers.update(self.headers)
        self._id_cache: Dict[str, str] = {}  # name → id

    def _url(self, path: str) -> str:
        return f"{self.base_url}/tenants/{self.tenant}/databases/{self.database}{path}"

    def _request(self, method: str, path: str, **kwargs) -> Any:
        kwargs.setdefault("timeout", 30)
        url = self._url(path)
        resp = self._session.request(method, url, **kwargs)
        resp.raise_for_status()
        return resp.json()

    def _refresh_id_cache(self) -> None:
        """Refresh the name→id cache from the server."""
        collections = self.list_collections()
        self._id_cache = {c["name"]: c["id"] for c in collections}

    def _get_id(self, name: str) -> str:
        """Get collection UUID by name, using cache."""
        if name not in self._id_cache:
            self._refresh_id_cache()
        if name not in self._id_cache:
            raise ValueError(f"Collection '{name}' not found")
        return self._id_cache[name]

    def heartbeat(self) -> int:
        url = f"{self.base_url}/heartbeat"
        resp = self._session.get(url, timeout=15)
        resp.raise_for_status()
        return resp.json().get("nanosecond heartbeat", 0)

    def list_collections(self) -> List[Dict]:
        return self._request("get", "/collections")

    def get_collection(self, name: str) -> Dict:
        """Get collection by name (uses ID from cache or fetches)."""
        try:
            cid = self._get_id(name)
            return self._request("get", f"/collections/{cid}")
        except ValueError:
            raise requests.exceptions.HTTPError(response=_error_response(404))

    def get_or_create_collection(self, name: str, metadata: Optional[Dict] = None) -> Dict:
        """Get existing or create new collection."""
        try:
            return self.get_collection(name)
        except (requests.HTTPError, ValueError):
            body: Dict[str, Any] = {"name": name}
            if metadata:
                body["metadata"] = metadata
            result = self._request("post", "/collections", json=body)
            self._id_cache[name] = result["id"]
            return result

    def count(self, collection_name: str) -> int:
        cid = self._get_id(collection_name)
        return self._request("get", f"/collections/{cid}/count")

    def query(
        self,
        collection_name: str,
        query_embeddings: List[List[float]],
        n_results: int = 10,
        include: Optional[List[str]] = None,
    ) -> Dict:
        cid = self._get_id(collection_name)
        body: Dict[str, Any] = {
            "query_embeddings": query_embeddings,
            "n_results": n_results,
        }
        if include:
            body["include"] = include
        return self._request("post", f"/collections/{cid}/query", json=body)

    def add(
        self,
        collection_name: str,
        ids: List[str],
        documents: List[str],
        embeddings: List[List[float]],
        metadatas: Optional[List[Dict]] = None,
    ) -> Any:
        cid = self._get_id(collection_name)
        body: Dict[str, Any] = {
            "ids": ids,
            "documents": documents,
            "embeddings": embeddings,
        }
        if metadatas:
            body["metadatas"] = metadatas
        return self._request("post", f"/collections/{cid}/add", json=body)

    def delete_collection(self, name: str) -> bool:
        try:
            cid = self._get_id(name)
            self._request("delete", f"/collections/{cid}")
            self._id_cache.pop(name, None)
            return True
        except Exception:
            return False


def _error_response(status_code: int):
    """Create a minimal mock response for error handling."""
    resp = requests.models.Response()
    resp.status_code = status_code
    resp._content = b"{}"
    return resp
