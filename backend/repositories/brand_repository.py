from typing import Any, Dict, List, Optional, Union

from backend.repositories.base_repository import BaseRepository


class BrandRepository(BaseRepository):
    def __init__(self) -> None:
        super().__init__("brands.json")

    def get_all(self) -> List[Dict[str, Any]]:
        return self._load_data()

    def get_by_id(self, brand_id: Union[int, str]) -> Optional[Dict[str, Any]]:
        for brand in self._load_data():
            if str(brand.get("id")) == str(brand_id):
                return brand
        return None
