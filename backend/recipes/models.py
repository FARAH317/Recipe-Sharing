from django.conf import settings
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
class Recipe(models.Model):
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="recipes"
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    cuisine = models.CharField(max_length=80, blank=True)
    cook_time_minutes = models.PositiveIntegerField(default=0)
    photo = models.ImageField(upload_to="recipes/", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        ordering = ["-created_at"]
    def __str__(self):
        return self.title
class Ingredient(models.Model):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name="ingredients")
    name = models.CharField(max_length=120)
    quantity = models.CharField(max_length=60, blank=True)  # free text: "2 cups", "500g"
    class Meta:
        order_with_respect_to = "recipe"
    def __str__(self):
        return f"{self.quantity} {self.name}".strip()
class Step(models.Model):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name="steps")
    order = models.PositiveIntegerField()
    instruction = models.TextField()
    class Meta:
        ordering = ["order"]
    def __str__(self):
        return f"Step {self.order} of {self.recipe_id}"
class Favorite(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="favorites"
    )
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name="favorited_by")
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "recipe"], name="unique_favorite")
        ]
class Review(models.Model):
    """Bonus: rating + review per recipe."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reviews"
    )
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name="reviews")
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(fields=["user", "recipe"], name="unique_review_per_user")
        ]
