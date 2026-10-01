from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Recipe, Favorite, Review
from .serializers import (
    RecipeListSerializer,
    RecipeDetailSerializer,
    FavoriteSerializer,
    ReviewSerializer,
    RegisterSerializer,
)


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "user": {"id": user.id, "username": user.username},
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            status=status.HTTP_201_CREATED,
        )


class IsAuthorOrReadOnly(permissions.BasePermission):
    """Anyone can read; only the recipe's author can edit or delete it."""
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.author_id == request.user.id
class RecipeViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]
    def get_serializer_class(self):
        if self.action == "list":
            return RecipeListSerializer
        return RecipeDetailSerializer
    def get_serializer_context(self):
        return {"request": self.request}
    def get_queryset(self):
        qs = Recipe.objects.all().prefetch_related("ingredients", "steps", "reviews")
        params = self.request.query_params
        search = params.get("search")
        ingredient = params.get("ingredient")
        cuisine = params.get("cuisine")
        max_time = params.get("max_cook_time")
        min_time = params.get("min_cook_time")
        if search:
            qs = qs.filter(title__icontains=search)
        if ingredient:
            qs = qs.filter(ingredients__name__icontains=ingredient).distinct()
        if cuisine:
            qs = qs.filter(cuisine__icontains=cuisine)
        if max_time:
            qs = qs.filter(cook_time_minutes__lte=max_time)
        if min_time:
            qs = qs.filter(cook_time_minutes__gte=min_time)
        return qs
    @action(detail=True, methods=["get", "post"], permission_classes=[permissions.IsAuthenticatedOrReadOnly])
    def reviews(self, request, pk=None):
        recipe = self.get_object()
        if request.method == "GET":
            serializer = ReviewSerializer(recipe.reviews.all(), many=True)
            return Response(serializer.data)
        # POST — create or update the current user's review for this recipe
        if not request.user.is_authenticated:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        existing = recipe.reviews.filter(user=request.user).first()
        serializer = ReviewSerializer(
            existing, data=request.data, context={"request": request, "recipe": recipe}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
class FavoriteViewSet(viewsets.ModelViewSet):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_serializer_context(self):
        return {"request": self.request}
    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user).select_related("recipe")
