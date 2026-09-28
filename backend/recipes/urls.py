from rest_framework.routers import DefaultRouter
from .views import RecipeViewSet, FavoriteViewSet
router = DefaultRouter()
router.register("recipes", RecipeViewSet, basename="recipe")
router.register("favorites", FavoriteViewSet, basename="favorite")
urlpatterns = router.urls
# Key routes:
#   GET/POST    /recipes/?search=&ingredient=&cuisine=&min_cook_time=&max_cook_time=
#   GET/PUT/DELETE /recipes/{id}/     (edit/delete: author only)
#   GET/POST    /recipes/{id}/reviews/
#   GET/POST/DELETE /favorites/
