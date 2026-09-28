from django.db.models import Avg
from rest_framework import serializers
from .models import Recipe, Ingredient, Step, Favorite, Review
class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = ["id", "name", "quantity"]
class StepSerializer(serializers.ModelSerializer):
    class Meta:
        model = Step
        fields = ["id", "order", "instruction"]
class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    class Meta:
        model = Review
        fields = ["id", "username", "rating", "comment", "created_at"]
        read_only_fields = ["id", "created_at"]
    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        validated_data["recipe"] = self.context["recipe"]
        return super().create(validated_data)
class RecipeListSerializer(serializers.ModelSerializer):
    """Lightweight version for browsing/search results."""
    author_name = serializers.CharField(source="author.username", read_only=True)
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    is_favorited = serializers.SerializerMethodField()
    is_author = serializers.SerializerMethodField()
    class Meta:
        model = Recipe
        fields = [
            "id", "title", "cuisine", "cook_time_minutes", "photo",
            "author_name", "average_rating", "review_count", "is_favorited", "is_author", "created_at",
        ]
    def get_average_rating(self, obj):
        return obj.reviews.aggregate(avg=Avg("rating"))["avg"]
    def get_review_count(self, obj):
        return obj.reviews.count()
    def get_is_favorited(self, obj):
        user = self.context["request"].user
        if not user.is_authenticated:
            return False
        return obj.favorited_by.filter(user=user).exists()
    def get_is_author(self, obj):
        user = self.context["request"].user
        return user.is_authenticated and obj.author_id == user.id
class RecipeDetailSerializer(RecipeListSerializer):
    """Full version with nested ingredients/steps/reviews, writable."""
    ingredients = IngredientSerializer(many=True)
    steps = StepSerializer(many=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    class Meta(RecipeListSerializer.Meta):
        fields = RecipeListSerializer.Meta.fields+[
            "description", "ingredients", "steps", "reviews",
        ]
    def create(self, validated_data):
        ingredients_data = validated_data.pop("ingredients")
        steps_data = validated_data.pop("steps")
        validated_data["author"] = self.context["request"].user
        recipe = Recipe.objects.create(**validated_data)
        ingredient_objects = [
            Ingredient(recipe=recipe, _order=index, **ing)
            for index, ing in enumerate(ingredients_data)
        ]
        Ingredient.objects.bulk_create(ingredient_objects)
        step_objects = [
            Step(recipe=recipe, **step)
            for step in steps_data
        ]
        Step.objects.bulk_create(step_objects)
        return recipe
    def update(self, instance, validated_data):
        ingredients_data = validated_data.pop("ingredients", None)
        steps_data = validated_data.pop("steps", None)
        instance = super().update(instance, validated_data)
        if ingredients_data is not None:
            instance.ingredients.all().delete()
            Ingredient.objects.bulk_create([
                Ingredient(recipe=instance, _order=index, **ing)
                for index, ing in enumerate(ingredients_data)
            ])
        if steps_data is not None:
            instance.steps.all().delete()
            Step.objects.bulk_create([
                Step(recipe=instance, **step)
                for step in steps_data
            ])
        return instance
class FavoriteSerializer(serializers.ModelSerializer):
    recipe_detail = RecipeListSerializer(source="recipe", read_only=True)
    class Meta:
        model = Favorite
        fields = ["id", "recipe", "recipe_detail", "created_at"]
        read_only_fields = ["id", "created_at"]
    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)
