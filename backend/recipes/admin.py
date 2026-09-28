from django.contrib import admin
from .models import Recipe, Ingredient, Step, Favorite, Review
class IngredientInline(admin.TabularInline):
    model = Ingredient
    extra = 1
class StepInline(admin.TabularInline):
    model = Step
    extra = 1
@admin.register(Recipe)
class RecipeAdmin(admin.ModelAdmin):
    list_display = ["title", "author", "cuisine", "cook_time_minutes", "created_at"]
    inlines = [IngredientInline, StepInline]
admin.site.register(Favorite)
admin.site.register(Review)
