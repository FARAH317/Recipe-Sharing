from io import BytesIO
import tempfile
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from PIL import Image
from rest_framework.test import APIClient
from .models import Recipe
from .serializers import RecipeDetailSerializer
class RecipeSerializerTest(TestCase):
    def test_create_recipe_with_ingredients_and_steps(self):
        user = get_user_model().objects.create_user(username="alice", password="password123")
        request = type("Request", (), {"user": user})()
        payload = {
            "title": "Tomato soup",
            "description": "A warm soup",
            "cuisine": "French",
            "cook_time_minutes": 25,
            "ingredients": [
                {"name": "Tomato", "quantity": "3"},
                {"name": "Onion", "quantity": "1"},
            ],
            "steps": [
                {"order": 1, "instruction": "Chop vegetables"},
                {"order": 2, "instruction": "Cook and serve"},
            ],
        }
        serializer = RecipeDetailSerializer(data=payload, context={"request": request})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        recipe = serializer.save()
        self.assertEqual(recipe.ingredients.count(), 2)
        self.assertEqual(recipe.steps.count(), 2)
        self.assertEqual(recipe.author, user)
class RecipeOwnershipAPITest(TestCase):
    def setUp(self):
        user_model = get_user_model()
        self.owner = user_model.objects.create_user(username="owner", password="password123")
        self.other_user = user_model.objects.create_user(username="other", password="password123")
        self.recipe = Recipe.objects.create(author=self.owner, title="Original")
        self.client = APIClient()
    def test_owner_can_edit_and_delete_recipe(self):
        self.client.force_authenticate(user=self.owner)
        response = self.client.get(f"/api/recipes/{self.recipe.id}/")
        self.assertTrue(response.data["is_author"])
        response = self.client.patch(
            f"/api/recipes/{self.recipe.id}/", {"title": "Updated"}, format="json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["title"], "Updated")
        response = self.client.delete(f"/api/recipes/{self.recipe.id}/")
        self.assertEqual(response.status_code, 204)
        self.assertFalse(Recipe.objects.filter(id=self.recipe.id).exists())
    def test_other_user_cannot_edit_or_delete_recipe(self):
        self.client.force_authenticate(user=self.other_user)
        response = self.client.get(f"/api/recipes/{self.recipe.id}/")
        self.assertFalse(response.data["is_author"])
        response = self.client.patch(
            f"/api/recipes/{self.recipe.id}/", {"title": "Hijacked"}, format="json"
        )
        self.assertEqual(response.status_code, 403)
        response = self.client.delete(f"/api/recipes/{self.recipe.id}/")
        self.assertEqual(response.status_code, 403)
        self.assertTrue(Recipe.objects.filter(id=self.recipe.id).exists())
    def test_owner_can_upload_recipe_photo(self):
        image_buffer = BytesIO()
        Image.new("RGB", (1, 1)).save(image_buffer, format="PNG")
        image_buffer.seek(0)
        upload = SimpleUploadedFile("recipe.png", image_buffer.read(), content_type="image/png")
        self.client.force_authenticate(user=self.owner)
        with tempfile.TemporaryDirectory() as media_root, override_settings(MEDIA_ROOT=media_root):
            response = self.client.patch(
                f"/api/recipes/{self.recipe.id}/", {"photo": upload}, format="multipart"
            )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["photo"].endswith("recipe.png"))
